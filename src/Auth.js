import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import React, { useState, useEffect } from "react";
import App from "./App";

const provider = new firebase.auth.GoogleAuthProvider();

// Find these options in your Firebase console
firebase.initializeApp({
    apiKey: "AIzaSyCETOnp4nISRpWTZRe-AhZVGOY6EQrI5s8",
    authDomain: "fir-with-hasura.firebaseapp.com",
    databaseURL: "https://fir-with-hasura.firebaseio.com",
    projectId: "fir-with-hasura",
    storageBucket: "fir-with-hasura.appspot.com",
    messagingSenderId: "965231196191",
    appId: "1:965231196191:web:41525c5056c84d8c7a7d2a"
});

export default function Auth() {
    const [authState, setAuthState] = useState({ status: "loading" });

    useEffect(() => {
        return firebase.auth().onAuthStateChanged(async user => {
            if (user) {
                const token = await user.getIdToken();
                const idTokenResult = await user.getIdTokenResult();
                const hasuraClaim =
                    idTokenResult.claims["https://hasura.io/jwt/claims"];

                if (hasuraClaim) {
                    setAuthState({ status: "in", user, token });
                } else {
                    // Check if refresh is required.
                    const metadataRef = firebase
                        .database()
                        .ref("metadata/" + user.uid + "/refreshTime");

                    metadataRef.on("value", async () => {
                        // Force refresh to pick up the latest custom claims changes.
                        const token = await user.getIdToken(true);
                        setAuthState({ status: "in", user, token });
                    });
                }
            } else {
                setAuthState({ status: "out" });
            }
        });
    }, []);

    const signInWithGoogle = async () => {
        try {
            await firebase.auth().signInWithPopup(provider);
        } catch (error) {
            console.log(error);
        }
    };

    const signOut = async () => {
        try {
            setAuthState({ status: "loading" });
            await firebase.auth().signOut();
            setAuthState({ status: "out" });
        } catch (error) {
            console.log(error);
        }
    };

    let content;
    if (authState.status === "loading") {
        content = null;
    } else {
        content = (
            <>
                <div>
                    {authState.status === "in" ? (
                        <div>
                            <h2>Welcome, {authState.user.displayName}</h2>
                            <button onClick={signOut}>Sign out</button>
                        </div>
                    ) : (
                            <button onClick={signInWithGoogle}>Sign in with Google</button>
                        )}
                </div>

                <App authState={authState} />
            </>
        );
    }

    return <div className="auth">{content}</div>;
}