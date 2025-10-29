"use client";
import * as z from "zod";
import { CardWrapper } from "@/components/auth/card-wrapper"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ResetSchema } from "@/schemas";

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
import { reset } from "@/actions/reset";


export const ResetForm=()=>{
   
   

    const [error,setError]=useState<string | undefined>("");
    const [isPending,setTransition]=useTransition();
    const[success,setSuccess]=useState<string | undefined>("")
    const form=useForm<z.infer<typeof ResetSchema>>({
        resolver:zodResolver(ResetSchema),
        defaultValues:{
            email:"",
        },
    })
    const onSubmit =(values:z.infer<typeof ResetSchema>)=>{
        setError("");
        setSuccess("");

        
        setTransition(()=>{
            reset(values)
                .then((data)=>{
                    setError(data?.error);
                    //TODO: Add when we add 2FA
                    setSuccess(data?.success);
                })
        })
    }
    return(
        <CardWrapper
            headerLabel="Forgot your Password"
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
                        name="email"
                        render={({field})=>(
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        disabled={isPending}
                                        placeholder="xyz@example.com"
                                        type="email"
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
                    Send reset email
                </Button>
                </form>
            </Form>
        </CardWrapper>
    )
}