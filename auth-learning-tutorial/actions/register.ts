"use server"; //Equivalent of an API Route
import { RegisterSchema } from "@/schemas";
import bcrypt from "bcrypt";
import * as z from "zod";
import { db } from "@/lib/db";
import { getUserByemail } from "@/data/user";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";


export const register=async(values:z.infer<typeof RegisterSchema>)=>{
    const validatedFields =RegisterSchema.safeParse(values);

    if(!validatedFields.success){
        return {error:"Invalid Fields"};
    }

    const {email,password,name}=validatedFields.data;
    const hashedPassword=await bcrypt.hash(password,10);
    
    const existingUser = await getUserByemail(email);

    if(existingUser){
        return {error:"Email aready in use!"}
    }

    await db.user.create({
        data:{
            name,
            email,
            password:hashedPassword,
        },
    });

    const verificationToken=await generateVerificationToken(email);
    //Send verification Token Email
    await sendVerificationEmail(
        verificationToken.email,
        verificationToken.token,
    );

    return {success:"Email Sent"}
};

