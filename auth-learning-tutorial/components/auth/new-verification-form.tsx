"use client";
import { useCallback,useEffect,useState} from "react";
import {BeatLoader} from "react-spinners";
import { CardWrapper } from "@/components/auth/card-wrapper";
import { useSearchParams } from "next/navigation";
import { newVerification } from "@/actions/new-verification";
import { FormSuccess } from "../ui/form-success";
import { FormError } from "../ui/form-error";


export const NewVerificationForm=()=>{
    const [error,setError]=useState<string|undefined>();
    const [success,setSuccess]=useState<string|undefined>();
    const searchParams=useSearchParams();
    const token=searchParams.get("token");
    const onSubmit=useCallback(()=>{
        if(!token) {
            setError("Missing Token");
            return
        }
        newVerification(token)
          .then((data)=>{
            setSuccess(data.success);
            setError(data.error);
          })
          .catch(()=>{
            setError("Something Went Wrong");
          })
            
    },[token]);

    useEffect(()=>{
        onSubmit();
    },[onSubmit])

    return(
        <CardWrapper
            headerLabel="Confirming your Verificaion"
            backButtonHref="/auth/login"
            backButtonLabel="Back to Login"
        >
            <div className="flex items-center w-full justify-center">
                {!success && !error &&(
                    <BeatLoader/>
                )}
                
                <FormSuccess message={success}/>
                <FormError message={error}/>
            </div>

        </CardWrapper>
    )
}