import React from 'react';
import { Icons } from "@/core/helpers/icons";

const BadgePro = () => {
  
  return (
   <div>
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
        <Icons.Crown className="w-4 h-4" />
        Pro
    </span>
</div>
  );
};

export default BadgePro;



