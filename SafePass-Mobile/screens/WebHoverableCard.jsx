import React, { useState } from "react";
import { TouchableOpacity, Platform } from "react-native";

const isWeb = Platform.OS === "web";

export const WebHoverableCard = ({ children, style, hoverStyle, ...props }) => {
  const [isHovered, setIsHovered] = useState(false);

  if (!isWeb) {
    return (
      <TouchableOpacity style={style} {...props}>
        {children}
      </TouchableOpacity>
    );
  }

  const combinedStyle = [
    style,
    isHovered && hoverStyle,
  ];

  return (
    <div
      style={combinedStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={props.onPress}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          props.onPress();
        }
      }}
    >
      {children}
    </div>
  );
};