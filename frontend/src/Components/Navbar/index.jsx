import React from 'react'
import styles from './styles.module.css'
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { reset } from '@/config/redux/reducer/authReducer';

export default function NavBarComponent() {

    const router=useRouter();
    const dispatch=useDispatch();

    const authState=useSelector((state)=>state.auth);
    

  return (
    <div className={styles.container}>
      <nav className={styles.navBar}>
        <h2
          style={{ cursor: "pointer" }}
          onClick={() => {
            router.push("/");
          }}
        >
          Pro Connect
        </h2>

        <div className={styles.navBarOptionContainer}>
          {authState.loggedIn && authState.profileFetched ? (
            <div>
              <div
                style={{
                  display: "flex",
                  gap: "1.2rem",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <button
                  style={{
                    borderRadius: "10px",
                    cursor: "pointer",
                    padding: "0.5rem 1rem ",
                  }}
                >
                  <div
                    onClick={() => {
                      router.push("/profile");
                    }}
                    style={{ fontWeight: "bold", cursor: "pointer" }}
                  >
                    Profile
                  </div>
                </button>

                <button
                  style={{
                    borderRadius: "10px",
                    cursor: "pointer",
                    padding: "0.5rem 1rem ",
                    color: "white",
                    backgroundColor: " #AE556B",
                  }}
                >
                  <div
                    onClick={() => {
                      localStorage.removeItem("token");
                      router.push("/login");
                      dispatch(reset());
                    }}
                    style={{ fontWeight: "bold", cursor: "pointer" }}
                  >
                    Logout
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => {
                router.push("/login");
              }}
              className={styles.buttonJoin}
            >
              Be a part
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}
