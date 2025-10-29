import { db } from "@/lib/db";
export const getTwoFactorAuthenticationTokenbyToken=async(token:string)=>{
    try{
        const twoFactorToken=await db.twoFAToken.findUnique({
            where:{token}
        });
        return twoFactorToken;
    }catch{
       return null; 
    }
};

export const getTwoFactorAuthenticationTokenbyWmail=async(email:string)=>{
    try{
        const twoFactorToken=await db.twoFAToken.findFirst({
            where:{email}
        });
        return twoFactorToken;
    }catch{
       return null; 
    }
};