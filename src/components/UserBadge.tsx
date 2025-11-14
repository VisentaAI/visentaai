import badgeGray from "@/assets/badge-gray.png";
import badgeBlue from "@/assets/badge-blue.png";
import badgeYellow from "@/assets/badge-yellow.png";

interface UserBadgeProps {
  badgeType?: 'default' | 'verified' | 'admin';
  className?: string;
}

export function UserBadge({ badgeType = 'default', className = "h-4 w-4" }: UserBadgeProps) {
  const getBadge = () => {
    switch (badgeType) {
      case 'admin':
        return badgeYellow;
      case 'verified':
        return badgeBlue;
      default:
        return badgeGray;
    }
  };

  const getAltText = () => {
    switch (badgeType) {
      case 'admin':
        return "Admin Badge";
      case 'verified':
        return "Verified Creator Badge";
      default:
        return "User Badge";
    }
  };

  return (
    <img 
      src={getBadge()} 
      alt={getAltText()} 
      className={className}
    />
  );
}
