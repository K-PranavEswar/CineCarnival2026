import {createContext,useContext,useState} from "react";
const AuthContext=createContext(null);
export function AuthProvider({children}){
const [user,setUser]=useState(()=>{
try{
const storedUser=localStorage.getItem("user");
const token=localStorage.getItem("token");
return storedUser&&token?JSON.parse(storedUser):null;
}catch{
localStorage.removeItem("user");
localStorage.removeItem("token");
return null;
}
});

const login=(userData,token)=>{
localStorage.setItem("user",JSON.stringify(userData));
localStorage.setItem("token",token);
setUser(userData);
};

const logout=()=>{
localStorage.removeItem("user");
localStorage.removeItem("token");
setUser(null);
};

const updateUser=(userData)=>{
localStorage.setItem("user",JSON.stringify(userData));
setUser(userData);
};

const isAuthenticated=!!user;
const isAdmin=user?.role==="admin";

return(
<AuthContext.Provider value={{user,login,logout,updateUser,isAuthenticated,isAdmin}}>
{children}
</AuthContext.Provider>
);
}

export function useAuth(){
const context=useContext(AuthContext);
if(!context)throw new Error("useAuth must be used inside AuthProvider");
return context;
}
