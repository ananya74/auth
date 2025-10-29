"use client";
import * as z from "zod";
import { CardWrapper } from "@/components/auth/card-wrapper"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { NewPasswordSchema } from "@/schemas";

import {Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form"
import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { FormSuccess } from "@/components/ui/form-success";
import { newPassword } from "@/actions/new-password";
import { useSearchParams } from "next/navigation";

export const NewPasswordForm=()=>{
   const searchParams=useSearchParams();
   const token=searchParams.get("token");

    const [error,setError]=useState<string | undefined>("");
    const [isPending,setTransition]=useTransition();
    const[success,setSuccess]=useState<string | undefined>("")
    const form=useForm<z.infer<typeof NewPasswordSchema>>({
        resolver:zodResolver(NewPasswordSchema),
        defaultValues:{
            password:"",
        },
    })
    const onSubmit =(values:z.infer<typeof NewPasswordSchema>)=>{
        setError("");
        setSuccess("");

        
        setTransition(()=>{
            newPassword(values,token)
                .then((data)=>{
                    setError(data?.error);
                    //TODO: Add when we add 2FA
                    setSuccess(data?.success);
                })
        })
    }
    return(
        <CardWrapper
            headerLabel="Enter a new Password"
            backButtonLabel="Back to Login"
            backButtonHref="/auth/login"
        >
            <Form {...form}>
                <form 
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                >
                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="password"
                        render={({field})=>(
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        disabled={isPending}
                                        placeholder="******"
                                        type="password"
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    
                </div>
                <FormError message={error }/>
                <FormSuccess message={success}/>
                <Button disabled={isPending} type="submit" className="w-full">
                    Reset Password
                </Button>
                </form>
            </Form>
        </CardWrapper>
    )
}