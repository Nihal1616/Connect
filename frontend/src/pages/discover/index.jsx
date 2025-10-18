import React, { useEffect } from 'react'
import UserLayout from "@/layout/UserLayout";
import DashboardLayout from "@/layout/DashboardLayout";
import { useDispatch, useSelector } from 'react-redux';
import { getAllUsers } from '@/config/redux/action/authAction';
import { BASE_URL } from '@/config';
import styles from "./index.module.css"
import { useRouter } from 'next/router';

export default function DiscoverPage() {
  const authState=useSelector((state)=>state.auth)
  const dispatch=useDispatch();
  const router=useRouter();

  useEffect(() => {
    if (!authState.all_profiles_fetching) {
      dispatch(getAllUsers());
    }
  });



  return (
    <UserLayout>
      <DashboardLayout>
        <div style={{height:"100vh"}}>
          <h1>Discover</h1>

          <div className={styles.allUserProfiles}>
            {authState.all_profiles_fetched &&
              authState.all_users.map((user) => {
                return (
                  <div
                  onClick={()=>{
                    router.push(`/view_profile/${user.userId.username}`)

                  }}
                   key={user._id} className={styles.userCard}>
                    <img
                    className={styles.userard_image}
                      src={`${BASE_URL}/uploads/${user.userId.profilePicture}`}
                      alt="profile"
                    />
                    <div>
                      <h1>{user.userId.name}</h1>
                      <p>@{user.userId.username}</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}
