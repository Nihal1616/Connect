import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import { useRouter } from "next/router";
import styles from '@/styles/Home.module.css'
import UserLayout from "@/layout/UserLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {

  const router=useRouter();
  return (
    <UserLayout>
      <>
        <div className={styles.container}>
          <div className={styles.mainContainer}>
            <div className={styles.mainContainer_left}>
              <p>Connect with your friends without Exaggeration</p>
              <p>A True social media platform ,with stories no blufs!</p>
              <div
                onClick={() => {
                  router.push("/login");
                }}
                className={styles.buttonJoin}
              >
                Join Now
              </div>
            </div>
            <div className={styles.mainContainer_right}>
              <img src="images/connect.PNG" />
            </div>
          </div>
        </div>
      </>
    </UserLayout>
  );
  
}
