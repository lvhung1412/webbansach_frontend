import React, { useEffect, useState } from 'react';

import * as UserService from '../../services/UserService';
import * as constant from '../../constant/index';
import Swal from 'sweetalert2';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../action/UserAction';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

import { Modal, ModalHeader, ModalBody, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import './Login.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

import Logo from '@/assets/images/login/logo.jpg';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailReset, setEmailReset] = useState('');

    const [modal, setModal] = useState(false);
    const [modal2, setModal2] = useState(false);

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); 

    const [verificationCode, setVerificationCode] = useState('');
    const [inputCode, setInputCode] = useState('');
    const [step, setStep] = useState('email'); // 'email' | 'verify' | 'reset'

    const [verificationStep, setVerificationStep] = useState(true); // true: bước nhập mã, false: bước nhập mật khẩu

    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        document.title = 'Social | Login';
    });
    //Hàm kiểm tra login
    const checkLogin = (result) => {
        if (result.data) {
            setTimeout(() => {
                Swal.fire({
                    icon: 'success',
                    title: 'You login successfully',
                    showConfirmButton: false,
                    timer: 1000,
                });
                setTimeout(() => {
                    dispatch(loginUser(result.data.userInfo, result.data.token));
                    navigate('/');
                }, 1000);
            }, constant.TIME_WAITING);
            updateDoc(doc(db, 'user', email.trim()), {
                isOnline: true,
            });
        } else {
            setTimeout(() => {
                Swal.fire({
                    icon: 'error',
                    title: result.message,
                    showConfirmButton: false,
                    timer: 1000,
                });
            }, constant.TIME_WAITING);
        }
        setTimeout(() => {
            toast.dismiss();
        }, constant.TIME_WAITING);
    };
    //Api kiểm tra username, password
    const login = async () => {
        const result = await UserService.loginCustomer({
            loginKey: email.trim(),
            password: password.trim(),
        });
        checkLogin(result);
    };
    //Xử lý khi login
    const handleLogin = (e) => {
        e.preventDefault();
        if (!constant.FORMAT_EMAIL.test(email.trim())) {
            toast.dark('Waiting a minute!');
            login();
        } else {
            Swal.fire({
                icon: 'warning',
                title: 'Username not allow space or special characters! Please try again.',
                showConfirmButton: true,
            });
        }
    };
    const handleSubmitEmail = async (e) => {
        e.preventDefault();
        if (emailReset === '' || emailReset.length < 10) {
            Swal.fire({
                icon: 'error',
                text: 'Please enter your email and try again',
            });
        } else {
                setModal(!modal); // mở modal nhập mã xác thực
                const response = await UserService.sendVerify(emailReset); // gửi email xác thực
                if(response.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Email sent',
                    text: 'Check your email and reset password',
                });
                setModal2(!modal2); // mở modal nhập mã xác thực
            }else {
                Swal.fire({
                    icon: 'error',
                    title: 'Failed',
                    text: 'Could not send verification code.',
                });
            }
        }
    };

        // Xử lý khi người dùng nhập mã xác thực
    const handleVerifyCode = async (e) => {
    e.preventDefault();

    try {
        const response = await UserService.verifyCode({
            email: emailReset,
            code: verificationCode,
        });
        // alert(response.success);

        // Kiểm tra kết quả trả về từ server
        if (response.success) {
            setVerificationStep(false); // chuyển sang bước nhập mật khẩu
            Swal.fire({
                icon: 'success',
                title: 'Code verified',
                text: 'You can now change your password.',
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Invalid code',
                text: 'Please enter the correct verification code.',
            });
        }
    } catch (error) {
        // Khi server trả lỗi (ví dụ 400, 401)
        Swal.fire({
            icon: 'error',
            title: 'Verification failed',
            text: error.response?.data?.message || 'An error occurred during verification.',
        });
    }
};

    const handleResetPass = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
        Swal.fire({
            icon: 'error',
            title: 'Passwords do not match',
        });
        return;
    }
    if (newPassword.trim().length < 8) {
        Swal.fire({
            icon: 'error',
            title: 'Password must be at least 8',
        });

        return;
    }

    if (newPassword.trim().search(/[0-9]/) < 0) {
        Swal.fire({
            icon: 'error',
            title: 'Password must be contain at least one digit',
        });

        return;
    }

    if (newPassword.trim().search(/[a-z]/) < 0) {
        Swal.fire({
            icon: 'error',
            title: 'Password must be contain at least one lowercase letter',
        });

        return;
    }

    if (newPassword.trim().search(/[A-Z]/) < 0) {
        Swal.fire({
            icon: 'error',
            title: 'Password must be contain at least one uppercase letter',
        });

        return;
    }

    try {
        // Gọi API cập nhật mật khẩu ở đây nếu có
        const response = await UserService.forgetPassword({ newPassword: newPassword, email: emailReset });
        if (response.success) {
            Swal.fire({
                icon: 'success',
                title: 'Reset successfully',
                text: 'Your password has been changed',
            });
            setModal2(false);
            setEmail(emailReset);
            setNewPassword('');
            setConfirmPassword('');
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Something went wrong',
            text: 'Please try again',
        });
    }
};

    return (
        <div className={'login'}>
            <ToastContainer />
            <Modal centered show={modal} onHide={() => setModal(!modal)}>
            <ModalHeader closeButton={true}>
                Reset password
            </ModalHeader>
            <ModalBody>
                {step === 'email' && (
                    <form action="">
                        <Row>
                            <div className="d-flex align-items-center py-3">
                                <Col lg={2}>
                                    <label>Email:</label>
                                </Col>
                                <input
                                    required
                                    value={emailReset}
                                    onChange={(e) => setEmailReset(e.target.value)}
                                    type="email"
                                    spellCheck={false}
                                    className="form-control"
                                    placeholder="Enter your email to reset"
                                />
                            </div>
                        </Row>
                        <div className="d-flex justify-content-end">
                            <button
                                onClick={handleSubmitEmail}
                                type="submit"
                                className="btn btn-primary mt-3"
                                style={{ fontSize: '1.5rem' }}
                            >
                                Submit
                            </button>
                        </div>
                    </form>
                )}
                {step === 'verify' && (
                    <form action="">
                        <Row>
                            <div className="d-flex align-items-center py-3">
                                <Col lg={3}>
                                    <label>Verification Code:</label>
                                </Col>
                                <input
                                    required
                                    type="text"
                                    spellCheck={false}
                                    className="form-control"
                                    placeholder="Enter the verification code"
                                    value={inputCode}
                                    onChange={(e) => setInputCode(e.target.value)}
                                />
                            </div>
                        </Row>
                        <div className="d-flex justify-content-end">
                            <button
                                onClick={handleVerifyCode}
                                type="submit"
                                className="btn btn-primary mt-3"
                                style={{ fontSize: '1.5rem' }}
                            >
                                Verify Code
                            </button>
                        </div>
                    </form>
                )}
            </ModalBody>
        </Modal>
<Modal centered show={modal2} onHide={() => setModal2(!modal2)}>
    <ModalHeader closeButton={true}>Reset password</ModalHeader>
    <ModalBody>
        {/* Bước 1: Nhập mã xác thực */}
        {verificationStep ? (
            <form onSubmit={handleVerifyCode}>
                <div className="d-flex align-items-center py-3">
                    <Col lg={3}>
                        <label>Verification Code:</label>
                    </Col>
                    <input
                        required
                        type="text"
                        spellCheck={false}
                        className="form-control"
                        placeholder="Enter verification code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                    />
                </div>
                <div className="d-flex justify-content-end">
                    <button
                        type="submit"
                        className="btn btn-primary mt-3"
                        style={{ fontSize: '1.5rem' }}
                    >
                        Verify Code
                    </button>
                </div>
            </form>
        ) : (
            // Bước 2: Nhập mật khẩu mới
            <form action="">
                <Row>
                    <div className="d-flex align-items-center py-3">
                        <Col lg={3}>
                            <label>Password:</label>
                        </Col>
                        <input
                            required
                            type="password"
                            spellCheck={false}
                            className="form-control"
                            placeholder="Enter your new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>
                    <div className="d-flex align-items-center py-3">
                        <Col lg={3}>
                            <label>Confirm password:</label>
                        </Col>
                        <input
                            required
                            type="password"
                            spellCheck={false}
                            className="form-control"
                            placeholder="Confirm password again"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                </Row>
                <div className="d-flex justify-content-end">
                    <button
                        onClick={handleResetPass}
                        type="submit"
                        className="btn btn-primary mt-3"
                        style={{ fontSize: '1.5rem' }}
                    >
                        Submit
                    </button>
                </div>
            </form>
        )}
    </ModalBody>
</Modal>

            <div className={'card'}>
                <Row>
                    <Col style={{ padding: '0' }}>
                        <div className="left"></div>
                    </Col>
                    <Col style={{ padding: '0' }}>
                        <div className={'right'}>
                            <img src={Logo} alt="Logo" />
                            <h1 className={'title'}>Social media</h1>
                            <form onSubmit={handleLogin}>
                                <input
                                    required
                                    type="text"
                                    spellCheck={false}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email, username or phone"
                                />
                                <input
                                    required
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Password"
                                />
                                <button>Login</button>
                            </form>
                            <p className={'align-left'} style={{ cursor: 'pointer' }} onClick={() => setModal(!modal)}>
                                Forgot password?
                            </p>

                            <p className={'align-left'}>
                                Don't have account?{' '}
                                <span>
                                    <Link to="/register" className="register-now">
                                        Register now
                                    </Link>
                                </span>
                            </p>
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default Login;
