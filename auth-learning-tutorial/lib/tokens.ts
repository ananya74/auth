import crypto from "crypto";
import { getVerificationTokenByEmail } from "@/data/verification-token";
import {v4 as uuidv4} from "uuid";
import { db } from "@/lib/db";
import { getPasswordResetTokenbyEmail } from "@/data/password-reset-token";
import { getTwoFactorAuthenticationTokenbyWmail } from "@/data/two-factor-token";

export const generatePasswordResetToken = async(email:string)=>{
    const token=uuidv4();
    const expires=new Date(new Date().getTime()+ 3600 * 1000);
    const existingToken=await getPasswordResetTokenbyEmail(email);

    if(existingToken){
        await db.passwordRestToken.delete({
            where:{
                id:existingToken.id,
            },
        });
    }

    const passwordRestToken=await db.passwordRestToken.create({
        data:{
            email,
            token,
            expires
        }
    });

    return passwordRestToken;
}

export const generateVerificationToken = async(email:string)=>{
    const token=uuidv4();
    const expires=new Date(new Date().getTime()+ 3600 * 1000);

    const existingToken=await getVerificationTokenByEmail(email);
    if(existingToken){
        await db.verificationToken.delete({
            where:{
                id:existingToken.id,
            },
        });
    }

    const verificationToken=await db.verificationToken.create({
        data:{
            email,
            token,
            expires,
        }
    });
    return verificationToken;
}

export const generateTwoFactorToken=async(email:string)=>{
    const token=crypto.randomInt(100000,1_000_000).toString();
    const expires=new Date(new Date().getTime() + 5 * 60 *1000);

    const existingToken=await getTwoFactorAuthenticationTokenbyWmail(email);

    if(existingToken){
        await db.twoFAToken.delete({
            where:{
                id:existingToken.id,
            }
        })
    }

    const twoFactorToken=await db.twoFAToken.create({
        data:{
            email,
            token,
            expires,
        }
    })

    return twoFactorToken;
}