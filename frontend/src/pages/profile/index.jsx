import { getAllUsers } from "@/config/redux/action/authAction";
import { deletePost, getAboutUser, getAllPosts } from "@/config/redux/action/postAction";
import DashboardLayout from "@/layout/DashboardLayout";
import UserLayout from "@/layout/UserLayout";
import React, { useEffect, useState } from "react";
import styles from "./index.module.css";
import { BASE_URL, clientServer, getImageUrl } from "@/config";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";

export default function ProfilePage() {
  const dispatch = useDispatch();

  const authState = useSelector((state) => state.auth);
  const postReducer = useSelector((state) => state.postReducer);

  const [userProfile, setUserProfile] = useState([]);
  const [userPosts, setUserPost] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputData, setInputData] = useState({
    company: "",
    position: "",
    years: "",
  });

  const handleWorkInputChange = (e) => {
    const { name, value } = e.target;
    setInputData({ ...inputData, [name]: value });
  };

  useEffect(() => {
    dispatch(getAboutUser({ token: localStorage.getItem("token") }));
    dispatch(getAllUsers());
    dispatch(getAllPosts());
  }, []);

  useEffect(() => {
    if (authState.user != undefined) {
      setUserProfile(authState.user);
      const filtered = postReducer.posts.filter(
        (post) => post.userId?.username === authState.user.userId.username
      );
      setUserPost(filtered);
    }
  }, [postReducer.posts, authState.user]);

  const updateProfilePicture = async (file) => {
    const formData = new FormData();
    formData.append("token", localStorage.getItem("token"));
    formData.append("profile_picture", file);

    const response = await clientServer.post(
      "/update_profile_picture",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    dispatch(getAboutUser({ token: localStorage.getItem("token") }));
  };

  const UpdateprofileData = async () => {
    const request = await clientServer.post("/user_update", {
      token: localStorage.getItem("token"),
      name: userProfile.userId.name,
    });

    const response = await clientServer.post("/update_profile_data", {
      token: localStorage.getItem("token"),
      bio: userProfile.bio,
      currentPost: userProfile.currentPost,
      pastWork: userProfile.pastWork,
      education: userProfile.education,
    });

    dispatch(getAboutUser({ token: localStorage.getItem("token") }));
  };

  return (
    <UserLayout>
      <DashboardLayout>
        {authState.user && userProfile?.userId && (
          <div className={styles.container}>
            <div className={styles.backDropContainer}>
              <label
                htmlFor="profilePictureUpload"
                className={styles.backDrop_overlay}
              >
                <p>Edit</p>
              </label>
              <input
                onChange={(e) => {
                  updateProfilePicture(e.target.files[0]);
                }}
                hidden
                type="file"
                id="profilePictureUpload"
              />
              <img className={styles.backDrop} src={getImageUrl(userProfile.userId?.profilePicture)} />
            </div>
            {userProfile != authState.user && (
              <div
                onClick={() => {
                  UpdateprofileData();
                }}
                className={styles.connection}
              >
                <button className={styles.connectionBtn}>Update Profile</button>
              </div>
            )}
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
                      alignItems: "start",
                      flexDirection: "column",
                      marginBottom: "10px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        width: "fit-content",
                        alignItems: "center",
                        gap: "1.2rem",
      
                      }}
                    >
                      <input
                        type="text"
                        className={styles.nameEdit}
                        value={userProfile.userId.name}
                        onChange={(e) =>
                          setUserProfile({
                            ...userProfile,
                            userId: {
                              ...userProfile.userId,
                              name: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className={styles.usernameWrapper}>
                      
                      <p className={styles.usernameEdit}>
                        @{userProfile.userId.username}
                      </p>

                    </div>
                  </div>

                  {userProfile.bio.length != 0 ? (
                    <div>
                      <textarea
                        value={userProfile.bio}
                        onChange={(e) => {
                          setUserProfile({
                            ...userProfile,
                            bio: e.target.value,
                          });
                        }}
                        rows={Math.max(
                          3,
                          Math.ceil(userProfile.bio?.length / 80)
                        )}
                        style={{ width: "100%" }}
                      />
                    </div>
                  ) : (
                    <div>
                      <h4 style={{ color: "grey" }}>Add your Bio</h4>
                      <textarea
                        value={userProfile.bio}
                        onChange={(e) => {
                          setUserProfile({
                            ...userProfile,
                            bio: e.target.value,
                          });
                        }}
                        rows={Math.max(
                          3,
                          Math.ceil(userProfile.bio?.length / 80)
                        )}
                        style={{ width: "100%" }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <h3>Recent Posts</h3>
                  {userPosts.map((post) => {
                    return (
                      <div className={styles.postCard}>
                        <div className={styles.card}>
                          <div>
                            {post.userId._id === authState.user.userId._id && (
                              <div
                                className={styles.deleteBtn}
                                onClick={async () => {
                                  await dispatch(deletePost(post._id));
                                  await dispatch(getAllPosts());
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={1.5}
                                  stroke="currentColor"
                                  className="size-6"
                                  style={{
                                    height: "1.5rem",
                                    color: "red",
                                    cursor: "pointer",
                                  }}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                  />
                                </svg>
                              </div>
                            )}

                            {post.media !== "" ? (
                              <img className={styles.card_profileContianer} src={getImageUrl(post.media)} alt="Post" />
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
              <div onClick={() => [setIsModalOpen(true)]}>
                <button
                  style={{ cursor: "pointer" }}
                  className={styles.addWorkBtn}
                  onClick={() => {}}
                >
                  Add Work
                </button>
              </div>
            </div>

            {isModalOpen && (
              <div
                onClick={() => {
                  setIsModalOpen(false);
                }}
                className={styles.commentContainer}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  className={styles.allCommentsContainer}
                >
                  <input
                    onChange={handleWorkInputChange}
                    name="company"
                    type="text"
                    className={styles.inputField}
                    placeholder="Enter Company"
                    aria-label="text"
                    aria-describedby="basic-addon1"
                  />
                  <input
                    onChange={handleWorkInputChange}
                    name="position"
                    type="text"
                    className={styles.inputField}
                    placeholder="Enter Position"
                    aria-label="text"
                    aria-describedby="basic-addon1"
                  />
                  <input
                    onChange={handleWorkInputChange}
                    name="years"
                    type="number"
                    className={styles.inputField}
                    placeholder="Years "
                    aria-label="number"
                    aria-describedby="basic-addon1"
                  />

                  <button
                    onClick={() => {
                      setUserProfile({
                        ...userProfile,
                        pastWork: [...userProfile.pastWork, inputData],
                      });
                      setIsModalOpen(false);
                    }}
                    className={styles.connectionBtn}
                  >
                    Add Work
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </DashboardLayout>
    </UserLayout>
  );
}
