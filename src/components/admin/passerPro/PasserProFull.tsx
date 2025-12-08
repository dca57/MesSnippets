import React from 'react';
import PasserProButton from './PasserProButton';
import IconePro from './IconePro';

const PasserProFull = () => {
  
  return (
<div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3">
    <IconePro />              
    <div className="flex-1">
    <h3 className="font-semibold text-amber-900 dark:text-amber-100 text-sm">
        Fonctionnalité réservée aux membres Pro
    </h3>
    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
        Passez à la version Pro pour bénéficier des suggestions IA illimitées et plus pertinentes.
    </p>
    <PasserProButton/>
    </div>
</div>

  );
};

export default PasserProFull;