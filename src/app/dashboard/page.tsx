"use client"

import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  clone_url: string;

}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  // const [repoName,setRepoName] = useState<string>("")
  

  async function fetchUserRepos(accessToken : string | undefined) {
    if (!accessToken) return;
    try {
      const response = await axios.get("https://api.github.com/user/repos", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch repositories:", error);
      return [];
    }
  }

  async function setWebhhokUrl(accessToken : string | undefined,owner : string | undefined | null, repoName : string | undefined) {
    try {
      console.log(process.env.NEXT_PUBLIC_WEBHOOK_URL)
      console.log(session)
        await axios.post(`https://api.github.com/repos/${owner}/${repoName}/hooks`,{
            name: "web",
            active: true,
            events: ["push"],
            config: {
              url: process.env.NEXT_PUBLIC_WEBHOOK_URL,
              content_type: "application/json",
            }
        },{
          headers : {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/vnd.github+json',
              'Content-Type': 'application/json',
              'X-GitHub-Api-Version': '2022-11-28',
          }
        })

        // console.log(response)
    } catch (error) {
      console.error("Failed to set webhook: ", error);
    }
  }
  
  useEffect(() => {
    if (session?.user?.accessToken) {
      fetchUserRepos(session.user.accessToken).then((data) => {
        console.log(data)
        setRepos(data);
      });
    }
    // console.log(process.env.NEXT_PUBLIC_WEBHOOK_URL)
  }, [session?.user?.accessToken]);

  if (status === "loading") return <p>Loading...</p>;

  if (!session || !session.user) {
    return (
      <div>
        <h1>You are not signed in</h1>
        <button onClick={() => signIn("github")}>Sign In with GitHub</button>
      </div>
    );
  }

  async function deployProject(githubUrl : string, id : number, repoName : string) {
      try {
          // setRepoName(repoName)
          // const response = await axios.post("http://localhost:4000/upload-code",{
          //   githubUrl,
          //   id
          // })
          await setWebhhokUrl(session?.user.accessToken,session?.user.name,repoName)
      } catch (error) {
          console.log(error)
      }
  }

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const logout = () => {
    // Add your logout logic here
    console.log("User logged out");
    setIsModalOpen(false);
  };

  return (
    <div>
      <nav className="flex items-center justify-between mb-5 px-12 py-4 bg-purple-600 text-white">
        <h2 className="text-lg font-bold">Your Repositories</h2>
        <div className="flex items-center space-x-4">
          <span className="text-lg font-bold">{session.user.name}</span>
          <Image onClick={toggleModal} src={session?.user.image || ""} alt="Profile" className="w-10 h-10 rounded-full border border-gray-700"/>
        </div>
      </nav>
      {isModalOpen && (
        <div className="absolute right-5 top-16 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-purple-200 rounded-lg w-80 p-6">
            <h3 className="text-xl font-semibold mb-4">User Information</h3>
            <div className="flex items-center mb-4">
              <Image src={''} alt="Profile" className="w-12 h-12 rounded-full mr-4"/>
              <div>
                <p className="font-medium">{session.user.name}</p>
                <p className="text-gray-600 text-sm">{session.user.email}</p>
              </div>
            </div>
            <button
              className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors"
              onClick={logout}
            >
              Logout
            </button>
            <button
              className="w-full mt-2 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              onClick={toggleModal}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <ul>
        {repos.map((repo : GitHubRepo) => (
          <div key={repo.id} className="mx-10 my-4">
            <div className="flex flex-row justify-between font-bold text-xl px-5 py-4 bg-purple-300 hover:bg-purple-400 rounded-lg">
              <li>{repo.full_name}</li>
              <button onClick={() => {deployProject(repo.clone_url,repo.id,repo.name)}} className="text-white hover:text-black hover:underline">Deploy</button>
            </div>
          </div>
        ))}
      </ul>
    </div>
  );
}
