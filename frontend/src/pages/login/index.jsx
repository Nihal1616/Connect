import React, { useEffect, useState } from "react";
import UserLayout from "@/layout/UserLayout";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import styles from "./style.module.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { loginUser, registerUser } from "@/config/redux/action/authAction";
import { emptyMessage } from "@/config/redux/reducer/authReducer";
import { getAboutUser } from "@/config/redux/action/postAction";

export default function LoginComponent() {
  const authState = useSelector((state) => state.auth);

  const router = useRouter();

  const dispatch = useDispatch();

  const [userLoginMethod, setUserLoginMethod] = useState(false);

  const [email, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");


  // Fetch profile after login
  useEffect(() => {
    if (authState.loggedIn && !authState.profileFetched) {
      dispatch(getAboutUser());
    }
  }, [authState.loggedIn, authState.profileFetched, dispatch]);

  // Redirect only after profile is fetched
  useEffect(() => {
    if (authState.loggedIn && authState.profileFetched) {
      router.push("/dashboard");
    }
  }, [authState.loggedIn, authState.profileFetched, router]);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      router.push("/dashboard");
    }
  });

  useEffect(() => {
    dispatch(emptyMessage());
  }, [userLoginMethod]);

  const handleRegister = () => {
    console.log("Registering...");
    dispatch(registerUser({ username, password, email, name }));
  };

  const handleLogin = () => {
    console.log("login");
    dispatch(loginUser({ email, password }));
  };

  return (
    <UserLayout>
      <div className={styles.container}>
        <div className={styles.cardContianer}>
          <div className={styles.cardContianer_left}>
            <p className={styles.cardleft_heading}>
              {userLoginMethod ? "Sign In" : "Sign Up"}
            </p>
            <p style={{ color: authState?.isError ? "red" : "green" }}>
              {typeof authState.message === "string"
                ? authState.message
                : authState.message?.message}
            </p>

            {!userLoginMethod && (
              <div className={styles.input}>
                <div className="input-group mt-3  mb-3">
                  <input
                    onChange={(e) => setUsername(e.target.value)}
                    type="text"
                    className="form-control"
                    placeholder="Username"
                    aria-label="Username"
                    aria-describedby="basic-addon1"
                  />
                </div>
                <div className="input-group mt-3 mb-3">
                  <input
                    onChange={(e) => setName(e.target.value)}
                    type="text"
                    className="form-control"
                    placeholder="Name"
                    aria-label="Name"
                    aria-describedby="basic-addon1"
                  />
                </div>
              </div>
            )}

            <div className="input-group mb-3">
              <input
                onChange={(e) => setEmailAddress(e.target.value)}
                type="text"
                className="form-control"
                placeholder="Email"
                aria-label="Email"
                aria-describedby="basic-addon1"
              />
            </div>
            <div className="input-group mt-3 mb-3">
              <input
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="form-control"
                placeholder="Password"
                aria-label="password"
                aria-describedby="basic-addon1"
              />
            </div>
            <div
              onClick={() => {
                if (userLoginMethod) {
                  handleLogin();
                } else {
                  handleRegister();
                }
              }}
              className="d-grid gap-2"
            >
              <button type="button" className="btn btn-success mt-3">
                {userLoginMethod ? "Sign In" : "Sign Up"}
              </button>
            </div>
          </div>
          <div className={styles.cardContianer_right}>
            <p>
              {userLoginMethod
                ? "Don't have an account"
                : "Already Have an Account?"}
            </p>
            <div
              onClick={() => {
                setUserLoginMethod(!userLoginMethod);
              }}
              className="d-grid gap-2"
            >
              <button type="button" className="btn btn-light mt-3">
                {!userLoginMethod ? "Sign In" : "Sign Up"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
