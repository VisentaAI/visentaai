import badgeGray from "@/assets/badge-gray.png";
import badgeBlue from "@/assets/badge-blue.png";
import badgeYellow from "@/assets/badge-yellow.png";

interface UserBadgeProps {
  verified?: boolean;
  isAdmin?: boolean;
  className?: string;
}

export function UserBadge({ verified = false, isAdmin = false, className = "h-4 w-4" }: UserBadgeProps) {
  const getBadge = () => {
    if (isAdmin) return badgeYellow;
    if (verified) return badgeBlue;
    return badgeGray;
  };

  const getAltText = () => {
    if (isAdmin) return "Admin Badge";
    if (verified) return "Verified Badge";
    return "User Badge";
  };

  return (
    <img 
      src={getBadge()} 
      alt={getAltText()} 
      className={className}
    />
  );
}
