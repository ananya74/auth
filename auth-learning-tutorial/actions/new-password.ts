"use server";
import * as z from "zod";
import { NewPasswordSchema } from "@/schemas";
import { error } from "console";
import { getPasswordResetTokenbyToken } from "@/data/password-reset-token";
import { Darker_Grotesque } from "next/font/google";
import { getUserByemail } from "@/data/user";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";


export const newPassword=async(
    values:z.infer<typeof NewPasswordSchema>,
    token?:string | null,
)=>{
    if(!token){
        return {error:"Missing Token"};
    }

    const validatedFields = NewPasswordSchema.safeParse(values);

    if (!validatedFields.success){
        return {error:"Invalid Fields"};
    }

    const {password} = validatedFields.data;

    const existingToken = await getPasswordResetTokenbyToken(token);

    if(!existingToken){
        return {error:"Invalid Token"};
    }

    const hasExpired=new Date(existingToken.expires) < new Date();

    if(hasExpired){
        return{error:"Token has Expired"};
    }

    const existingUser = await getUserByemail(existingToken.email);

    if (!existingUser) {
        return { error: "Email doesn't exist" };
    }


    const hashedPassword= await bcrypt.hash(password,10);

    await db.user.update({
        where:{id:existingUser.id},
        data:{password:hashedPassword},
    });

    await db.passwordRestToken.delete({
        where:{id:existingToken.id}
    });

    return {success:"Password Updated"};
};