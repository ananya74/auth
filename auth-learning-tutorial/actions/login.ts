"use server"; //Equivalent of an API Route
import { LoginSchema } from "@/schemas";
import { signIn } from "@/auth";
import * as z from "zod";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { AuthError } from "next-auth";
import { getUserByemail } from "@/data/user";
import { generateTwoFactorToken, generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail,sendTwoFactorEmail } from "@/lib/mail";
import { getTwoFactorAuthenticationTokenbyWmail } from "@/data/two-factor-token";
import { error } from "console";
import { db } from "@/lib/db";
import { getTwoFactorAuthenticationTokenbyUserId } from "@/data/two-factor-confirmation";

export const login=async(values:z.infer<typeof LoginSchema>)=>{
    const validatedFields =LoginSchema.safeParse(values);

    if(!validatedFields.success){
        return {error:"Invalid Fields"};
    }

    const {email,password,code}=validatedFields.data;
    const  existingUser = await getUserByemail(email);

    if(!existingUser || !existingUser.email ||!existingUser.password){
        return {error:"Invalid Credentials"}
    }

    if(!existingUser.emailVerified){
      const verificationToken=await generateVerificationToken(existingUser.email);
      await sendVerificationEmail(
        verificationToken.email,
        verificationToken.token,
      );
      return {success:"Confirmation email sent"};
    }

    if(existingUser.isTwoFactorEnabled && existingUser.email){

        if(code){
            //Verify Code
            const twoFAToken= await getTwoFactorAuthenticationTokenbyWmail(existingUser.email);

            if(!twoFAToken){
                return {error:"Invalid Code"};
            }

            if(twoFAToken.token!==code){
                return {error:"Invalid Code"}
            }

            const hasExpired = new Date(twoFAToken.expires)<new Date();

            if(hasExpired){
                return {error:"Code Expired"}
            }

            await db.twoFAToken.delete({
                where:{id:twoFAToken.id}
            });

            const existingConfirmation= await getTwoFactorAuthenticationTokenbyUserId(existingUser.id);
            if(existingConfirmation){
                await db.twoFactorConfirmation.delete({
                    where:{id:existingConfirmation.id}
                })
            }

            await db.twoFactorConfirmation.create({
                data:{
                    userId:existingUser.id,
                }
            });

        }
        else{
            const twoFactorToken = await generateTwoFactorToken(existingUser.email)
            await sendTwoFactorEmail(
                twoFactorToken.email,
                twoFactorToken.token,
            );
            return {twoFactor:true};
        }
    }

    try{
        await signIn("credentials",{
            email,
            password,
            redirectTo:DEFAULT_LOGIN_REDIRECT,
        })
        //return {success:"Login Confirmation"};
    }catch(error){
        if (error instanceof AuthError){
            switch(error.type){
                case "CredentialsSignin":
                    return { error: "Invalid Credentials"}
                default :
                    return {error:"Something Went Wrong"}
            }
        }
        throw error;
    }
};

