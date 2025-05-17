import classNames from 'classnames/bind';

import styles from './SidebarItem.module.scss';
import { useSelector } from 'react-redux';

const cx = classNames.bind(styles);
const SidebarItem = ({ icon, activeIcon, title, isActive, onClick, count = 0 }) => {
    const isDarkMode = useSelector((state) => state.theme.isDarkModeEnabled);

    return (
        <div className={cx('sidebar-item', `${isDarkMode ? 'hihi' : ''}`)} onClick={onClick}>
            <div className={cx('wrap-title')}>
                {isActive ? activeIcon : icon}
                <p className={cx('sidebar-title')} style={{ fontWeight: isActive ? '600' : 'normal' }}>
                    {title}
                </p>
            </div>
            {count > 0 && (
                <div
                    className={cx('count')}
                    style={{
                    minWidth: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    }}
                >
                    <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>{count}</span>
                </div>
                )}
        </div>
    );
};

export default SidebarItem;
