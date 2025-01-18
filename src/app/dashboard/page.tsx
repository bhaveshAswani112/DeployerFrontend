"use client"

import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";



interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  clone_url: string;

}

export default function Dashboard() {
  const { data: session, status } = useSession();
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

  async function setWebhookUrl(accessToken: string | undefined, owner: string | undefined | null, repoName: string | undefined) {
    // Input validation
    if (!accessToken || !owner || !repoName) {
        throw new Error('Missing required parameters');
    }

    try {
        const response = await axios.post(
            `https://api.github.com/repos/${owner}/${repoName}/hooks`,
            {
                name: "web",
                active: true,
                events: ["push"],
                config: {
                    url: process.env.NEXT_PUBLIC_WEBHOOK_URL,
                    content_type: "application/json",
                    secret: process.env.WEBHOOK_SECRET || "bhavesh"
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/vnd.github+json',
                    'Content-Type': 'application/json',
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            }
        );
        
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
                throw new Error(`Repository ${owner}/${repoName} not found or insufficient permissions`);
            }
        }
        console.log(error)
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
          const response = await axios.post("https://uploader.vanii.ai/upload-code",{
            githubUrl,
            id
          })
          await setWebhookUrl(session?.user.accessToken,session?.user.name,repoName)
      } catch (error) {
          console.log(error)
      }
  }

  return (
    <div>
      <h1>Hello, {session.user.name}</h1>
      <h2>Your Repositories:</h2>
      <ul>
        
        {repos.map((repo : GitHubRepo) => (
          <div key={repo.id}>
            <li>{repo.full_name}</li>
            <button onClick={() => {
              deployProject(repo.clone_url,repo.id,repo.name)
            }}>Deploy</button>
          </div>
        ))}
      </ul>
    </div>
  );
}
