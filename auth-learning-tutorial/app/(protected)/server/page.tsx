import { auth } from "@/auth";
import { UserInfo } from "@/components/ui/user-info";
import { currentUser } from "@/lib/auth";

const ServerPage=async()=>{
    const session=await currentUser();
    return(
        <UserInfo 
            user={session}
            label="Server Component"
        />
    )
}

export default ServerPage;
