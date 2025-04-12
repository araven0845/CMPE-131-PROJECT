import { useContext, createContext, useState, useEffect } from "react";
import { Text, SafeAreaView } from "react-native";
import { account } from '@/lib/appwrite.js'

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState(false);
    const [user, setUser] = useState(false);

    useEffect(() => {
        init();
    }, [])

    const init = async () => {
        checkAuth();
    };

    const checkAuth = async () => {
        try{
            const responseSession = await account.getSession('current');
            setSession(responseSession)
            const responseUser = await account.get();
            setUser(responseUser);
        } catch (error){
            console.log(error);
        }
        setLoading(false);
    }

    const signin = async ({email, password}) => {
        setLoading(true);
        try {
            const responseSession = await account.createEmailPasswordSession(
                email, 
                password
            );
            setSession(responseSession);
            const responseUser = await account.get();
            setUser(responseUser);
        } catch(error) {
            console.log(error)
        }
        setLoading(false);
    };

    const signout = async () => {
        setLoading(true);
        await account.deleteSession('current');
        setSession(null);
        setUser(null);
        setLoading(false);
    };

    const contextData = { session, user, signin, signout };
    return (
        <AuthContext.Provider value={contextData}>
            {loading ? (
                <SafeAreaView>
                    <Text style={{ color: 'white' }}>Loading...</Text>
                </SafeAreaView>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};

const useAuth = () => {
    return useContext(AuthContext);
};

export { useAuth, AuthContext, AuthProvider };
