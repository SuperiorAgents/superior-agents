"use client";

import { createContext, useContext, ReactNode } from "react";

interface UserContextProps {
  userData: {
    id: number;
    user_id: string;
    username: string;
    email: string;
    wallet_address: string;
  };
}

const defaultContextValue: UserContextProps = {
  userData: { id: 0, user_id: "", username: "", email: "", wallet_address: "" },
};

const UserContext = createContext<UserContextProps>(defaultContextValue);

export const UserProvider = ({
  children,
  userData,
}: {
  children: ReactNode;
  userData: any;
}) => {
  return (
    <UserContext.Provider value={{ userData }}>{children}</UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);

  return context;
};
