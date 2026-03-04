import { isFirebaseEnabled, auth } from './config';
import {
    signInWithPopup,
    GoogleAuthProvider,
    GithubAuthProvider,
    signOut as firebaseSignOut,
} from 'firebase/auth';

export const signInWithGoogle = isFirebaseEnabled && auth ? async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth!, provider);
} : null;

export const signInWithGithub = isFirebaseEnabled && auth ? async () => {
    const provider = new GithubAuthProvider();
    await signInWithPopup(auth!, provider);
} : null;

export const signOut = isFirebaseEnabled && auth ? async () => {
    await firebaseSignOut(auth!);
} : null;
