"use server";

import * as z from "zod";
import { ResetSchema } from "@/schemas";
import { getUserByemail } from "@/data/user";
import { generatePasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/mail";


export const reset=async(values:z.infer<typeof ResetSchema>)=>{
    const validatedFields=ResetSchema.safeParse(values);

    if(!validatedFields.success){
        return {error:"Invalid Email"};
    }

    const {email}=validatedFields.data;

    const existingUser=await getUserByemail(email);

    if(!existingUser){
        return {error:"Email not found"};
    }
    //TODO: Generate Token

    const passwordRestToken=await generatePasswordResetToken(email);
    await sendPasswordResetEmail(
        passwordRestToken.email,
        passwordRestToken.token,
    )

    return {success:"Reset Email Sent"};
}
