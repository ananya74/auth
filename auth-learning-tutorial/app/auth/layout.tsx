const AuthLayout= ({
    children
}:{
    children:React.ReactNode
}) => {
    return(
        <div className="h-full flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_#38bdf8,_#1e40af)] ">
            {children}
        </div>
    );
}

export default AuthLayout;