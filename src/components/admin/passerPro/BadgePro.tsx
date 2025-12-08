import React from 'react';
import { Icons } from "@/core/helpers/icons";

const BadgePro = () => {
  
  return (
   <div>
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
        <Icons.Crown className="w-3 h-3" />
        Pro
    </span>
</div>
  );
};

export default BadgePro;



