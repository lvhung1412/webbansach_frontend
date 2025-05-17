import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: 'AIzaSyC2kGXqq42ngJggcr9fESjhYfj2PcvNAGA',
    authDomain: 'social-media-459117.firebaseapp.com',
    databaseURL: 'https://social-media-459117-default-rtdb.asia-southeast1.firebasedatabase.app',
    projectId: 'social-media-459117',
    storageBucket: 'social-media-459117.firebasestorage.app',
    messagingSenderId: '929204873907',
    appId: '1:929204873907:web:f1a87e1acd79cba7559ec6',
    measurementId: 'G-XS362MJNDG',
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const db = getFirestore();
