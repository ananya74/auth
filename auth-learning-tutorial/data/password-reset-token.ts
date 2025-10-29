import { db } from "@/lib/db";

export const getPasswordResetTokenbyToken=async(token:string)=>{
    try{
        const passwordToken=await db.passwordRestToken.findUnique({
            where:{token}
        });
        return passwordToken;
    }catch{
        return null;
    }
}

export const getPasswordResetTokenbyEmail=async(email:string)=>{
    try{
        const passwordToken=await db.passwordRestToken.findFirst({
            where:{email}
        });
        return passwordToken;
    }catch{
        return null;
    }
}