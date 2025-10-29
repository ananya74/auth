import NextAuth,{DefaultSession} from "next-auth"
import authConfig from "@/auth.config";
import {PrismaAdapter} from "@auth/prisma-adapter";
import {db} from "@/lib/db"
import { getUserById } from "@/data/user";
import { UserRole } from "@prisma/client";
import { getTwoFactorAuthenticationTokenbyUserId } from "./data/two-factor-confirmation";
import { getAccountByUserId } from "./data/account";




export const { 
    handlers:{GET,POST},
    auth, 
    signIn,
    signOut,
} = NextAuth({
    pages:{
        signIn:"/auth/login",
        error:"/auth/error",
    },
    events:{
        async linkAccount({user}){
            await db.user.update({
                where:{id:user.id},
                data:{emailVerified:new Date()}
            })
        }
    },
    callbacks:{
        //For verification Emails temporarily blocked as we dont have a mail sending setup which is free
        //Resend is available but only for gmail that we used to login it from otherwise it needs registered domain

        async signIn({user,account}){
            //Allow Oauth without email verification
           if (account?.provider !== "credentials") return true;

           if (!user.id) return false;

            const existingUser=await getUserById(user.id);


            //prevent sign in without email verification
            if(!existingUser?.emailVerified) return false;

            //Add 2FA check
            if(existingUser.isTwoFactorEnabled){
                const twofactorConfirmation=await getTwoFactorAuthenticationTokenbyUserId(existingUser.id);

                if(!twofactorConfirmation) return false;

                //delete 2fa for next sign in
                await db.twoFactorConfirmation.delete({
                    where:{id:twofactorConfirmation.id}
                });
            }

            return true;
        },
        async session({token,session}){
            //console.log({sessionToken:token,})
            if (session.user && token.sub){
                session.user.id = token.sub;
            }
            
            if(token.role && session.user){
                session.user.role=token.role as UserRole;
            }

            if(session.user){
                session.user.isTwoFactorEnabled=token.isTwoFactorEnabled as boolean;
            }

            if(session.user){
                session.user.name=token.name;
                session.user.email=token.email as string;
                session.user.isOauth=token.isOauth as boolean;
            }

            return session;
        },
        async jwt({token}){
            
            if(!token.sub) return token;
            const existingUser = await getUserById(token.sub);

            if(!existingUser) return token;

            const existingAccount = await getAccountByUserId(existingUser.id);

            token.isOauth=!!existingAccount;
            token.name=existingUser.name;
            token.email=existingUser.email;
            token.role=existingUser.role;
            token.isTwoFactorEnabled=existingUser.isTwoFactorEnabled;
            
            return token;   
        }
    },
    adapter:PrismaAdapter(db),
    session:{strategy:"jwt"},
    ...authConfig,
});
//callbacks are asynchronous functions we can use to control what happens when an action is performed 