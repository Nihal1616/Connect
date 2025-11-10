import React, { use, useEffect } from 'react'
import UserLayout from "@/layout/UserLayout";
import DashboardLayout from "@/layout/DashboardLayout";
import { useDispatch, useSelector } from 'react-redux';
import { AcceptConnection, getAllUsers, getConnectionsRequest, getMyConnectionsRequest } from '@/config/redux/action/authAction';
import { BASE_URL, getImageUrl } from '@/config';
import styles from "./index.module.css"
import { useRouter } from 'next/router';
import { connection } from 'next/server';

export default function MyConnectionsPage() {
  const router=useRouter();
  const dispatch=useDispatch();
  const authState=useSelector((state)=>state.auth)

  useEffect(()=>{
    dispatch(getAllUsers());
    dispatch(getMyConnectionsRequest({token:localStorage.getItem("token")}));
    dispatch(getConnectionsRequest({token:localStorage.getItem("token")}));
  },[])

  useEffect(() => {
    console.log("ConnectionsRequest changed:", authState.connectionsRequest);
  }, [authState.connectionsRequest]);








  return (
    <UserLayout>
      <DashboardLayout>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.7rem",height:"100vh" }}
        >
          <h2>My Connections</h2>
          {authState.connectionsRequest?.length === 0 && (
            <h1>No Connection Request</h1>
          )}

          {authState.connectionsRequest?.length !== 0 &&
            authState.connectionsRequest
              ?.filter((connection) => connection.status_accepted === null)
              .map((user, index) => {
                return (
                  <div
                    onClick={() => {
                      router.push(`/view_profile/${user.userId.username}`);
                    }}
                    className={styles.userCard}
                    key={index}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1.2rem",
                        justifyContent: "space-between",
                      }}
                    >
                      <div className={styles.profilePicture}>
                        <img src={getImageUrl(user.userId.profilePicture)} alt="Profile" />
                      </div>

                      <div className={styles.userInfo}>
                        <h1>{user.userId.name}</h1>
                        <p style={{ color: "grey" }}>{user.userId.username}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(
                            AcceptConnection({
                              connectionId: user._id,
                              token: localStorage.getItem("token"),
                              action: "accepted",
                            })
                          );
                           dispatch(getMyConnectionsRequest({ token: localStorage.getItem("token") }));
                        }}
                        className={styles.connectedButton}
                      >
                        Accept
                      </button>
                    </div>
                  </div>
                );
              })}

          <h3>My Network</h3>
          
          {authState.connectionsRequest
            ?.filter((connection) => connection.status_accepted !== null)
            .map((user, index) => {
              return(
                <div
                onClick={() => {
                  router.push(`/view_profile/${user.userId.username}`);
                }}
                className={styles.userCard}
                key={index}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1.2rem",
                    justifyContent: "space-between",
                  }}
                >
                  <div className={styles.profilePicture}>
                    <img src={getImageUrl(user.userId.profilePicture)} alt="Profile" />
                  </div>

                  <div className={styles.userInfo}>
                    <h2>{user.userId.name}</h2>
                    <p style={{ color: "grey" }}>{user.userId.username}</p>
                  </div>
                </div>
              </div>
              )
              
            })}
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}
