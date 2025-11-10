import { BASE_URL, clientServer, getImageUrl } from "@/config";
import DashboardLayout from "@/layout/DashboardLayout";
import UserLayout from "@/layout/UserLayout";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import styles from "./index.module.css";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllUsers,
  getConnectionsRequest,
  getMyConnectionsRequest,
  sendConnectionRequest,
} from "@/config/redux/action/authAction";
import { getAllPosts } from "@/config/redux/action/postAction";
import { useRouter } from "next/router";

export default function ViewProfilePage({ userProfile }) {
  const dispatch = useDispatch();
  const router = useRouter();

  const searchParamers = useSearchParams();
  const postReducer = useSelector((state) => state.postReducer);
  const authState = useSelector((state) => state.auth);

  const [userPosts, setUserPost] = useState([]);
  const [isCurrentUserInConnection, setIsCurrentUserInConnection] =
    useState(false);
  const [isConnectionNull, setIsConnectionNull] = useState(true);
  const [downloadError, setDownloadError] = useState("");
  

  const getUserPost = async () => {
    await dispatch(getAllPosts());
    await dispatch(
      getConnectionsRequest({ token: localStorage.getItem("token") })
    );
    await dispatch(
      getMyConnectionsRequest({ token: localStorage.getItem("token") })
    );
  };

  useEffect(() => {
    if (!postReducer.posts.length) return;
    if (!router.query.username) return;

    const filtered = postReducer.posts.filter(
      (post) => post.userId.username === router.query.username
    );
    setUserPost(filtered);
  }, [postReducer.posts, router.query.username]);

  // useEffect(() => {
  //     if(authState.connections.some(
  //       (user) => user.connectionId === userProfile.userId._id
  //     )){
  //       setIsCurrentUserInConnection(true);
  //       if (
  //         authState.connections.find(
  //           (user) => user.connectionId._id === userProfile.userId._id
  //         ).status_accepted === true
  //       ) {
  //         setIsConnectionNull(false);
  //       }
  //     }
  // }, [authState.connections, userProfile?.userId]);

  useEffect(() => {
    console.log(authState.connections,userProfile.userId._id)
    if(authState.connections?.some(user=>user.connectionId._id===userProfile.userId._id)){
      setIsCurrentUserInConnection(true);
      if (
        authState.connections?.find(
          (user) => user.connectionId._id === userProfile.userId._id
        ).status_accepted === true
      ) {
        setIsConnectionNull(false);
      }
    }

    if (
      authState.connectionsRequest?.some(
        (user) => user.userId._id === userProfile.userId._id
      )
    ) {
      setIsCurrentUserInConnection(true);
      if (
        authState.connectionsRequest?.find(
          (user) => user.userId._id === userProfile.userId._id
        ).status_accepted === true
      ) {
        setIsConnectionNull(false);
      }
    }

    
  }, [authState.connections,authState.connectionsRequest, userProfile?.userId?._id]);



  useEffect(() => {
    if (localStorage.getItem("token")) {
      dispatch(getAllUsers());
    }
  }, [dispatch]);

  useEffect(() => {
    getUserPost();
  }, []);

  const handleDownloadResume = async () => {
    setDownloadError("");
    try {
      // Request backend to generate the resume PDF for this user
      const resp = await clientServer.get(`/user/download_resume`, {
        params: { user_id: userProfile.userId._id },
      });

      const fileName = resp.data?.message;
      if (!fileName) throw new Error("No file returned from server");

      const publicUrl = `${BASE_URL}/uploads/${fileName}`;
      window.open(publicUrl, "_blank");
    } catch (err) {
      console.error("Failed to download PDF:", err);
      setDownloadError("Unable to download resume. Try again later.");
    }
  };


  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.container}>
          <div className={styles.backDropContainer}>
            <img src={getImageUrl(userProfile.userId.profilePicture)} />
          </div>
          <div className={styles.profileContianer_detials}>
            <div
              style={{
                display: "flex",
                gap: "0.7rem",
                flexDirection: "column",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    width: "fit-content",
                    alignItems: "center",
                    gap: "0.5rem",
                    flexDirection:"column"
                  }}
                >
                  <h2>{userProfile.userId.name}</h2>
                  <p style={{ color: "grey" }}>
                    @{userProfile.userId.username}
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1.2rem",
                    marginTop: "0.5rem",
                  }}
                >
                  
                  
                    {isCurrentUserInConnection ? (
                    <button className={styles.connectedButton} disabled>
                      {isConnectionNull ? "Pending" : "Connected"}
                    </button>
                  ) : (
                    <button
                      onClick={async()=>{
                        setIsCurrentUserInConnection(true)
                        setIsConnectionNull(true)
                        await dispatch(
                          sendConnectionRequest({
                            token: localStorage.getItem("token"),
                            user_id: userProfile.userId._id,
                          })
                        );

                      }}
                      className={styles.connectBtn}
                    >
                      Connect
                    </button>
                  )}

                  <div
                    onClick={handleDownloadResume}
                    style={{
                      cursor: "pointer",
                      border: "1px solid black",
                      borderRadius: "10px",
                      paddingInline: "1.7rem",
                      paddingBlock: "0.2rem",
                      background: "#1E90FF",
                    }}
                  >
                    <svg
                      style={{ width: "1.2rem", color: "white" }}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                      />
                    </svg>
                  </div>
                  {downloadError && (
                    <p style={{ color: "#c0392b", marginTop: "0.5rem" }}>
                      {downloadError}
                    </p>
                  )}
                </div>

                <div style={{ marginTop: "1rem" }}>
                  <p>{userProfile.bio}</p>
                </div>
              </div>

              <div>
                <h3>Recent Posts</h3>
                {userPosts.map((post) => {
                  return (
                    <div className={styles.postCard}>
                      <div className={styles.card}>
                        <div className={styles.card_profileContianer}>
                          {post.media !== "" ? (
                            <img src={getImageUrl(post.media)} alt="Post" />
                          ) : (
                            <div style={{ width: "3.4rem", height: "3.4rem" }}></div>
                          )}
                        </div>

                        <p>{post.body}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="workHistory">
            <h3>Work History</h3>

            <div className={styles.workHistoryContainer}>
              {userProfile.pastWork?.map((work) => {
                return (
                  <div className={styles.workHistoryCard}>
                    <p
                      style={{
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.8rem",
                      }}
                    >
                      {work.company}-{work.position}
                    </p>
                    <p>{work.years}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}

export async function getServerSideProps(context) {
  const request = await clientServer.get(
    "/user/get_profile_based_on_username",
    {
      params: {
        username: context.query.username,
      },
    }
  );

  const response = request.data;
  console.log(response);

  return { props: { userProfile: request.data.profile } };
}
