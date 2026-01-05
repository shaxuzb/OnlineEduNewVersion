import React, { FC, ReactNode } from "react";
import LinearGradient from "react-native-linear-gradient";

interface CustomStyledCardProps {
  children: React.ReactNode;
  [key: string]: any;
}
export const CustomStyledCard: FC<CustomStyledCardProps> = ({
  children,
  ...props
}: {
  children: ReactNode;
}) => {
  return (
    <LinearGradient
      start={{ x: 0.5, y: 1.0 }}
      end={{ x: 0.5, y: 0.0 }}
      colors={["#3a5dde", "#5e84e6"]}
      {...props}
    >
      {children}
    </LinearGradient>
  );
};
