const licenseVariants = [
  [
    'MIT',
    'MIT license',
    'MIT License',
    'MIT no attribution',
    'MIT-License',
    'MIT licence',
    'MPLv2.0, MIT Licences',
    'The MIT License',
    'Expat license',
    'Expat',
    'MITNFA',
  ],
  [
    'Apache',
    'Apache License, Version 2.0',
    'Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0)',
    'Apache-2.0',
    'BSD-2-Clause or Apache-2.0',
    'Apache 2.0',
    'http://www.apache.org/licenses/LICENSE-2.0',
    'Apache License 2.0',
    'Apache Software License',
    'BSD or Apache License, Version 2.0',
    'BSD 3-Clause License or Apache License, Version 2.0',
    'The Apache License, Version 2.0',
    'The Apache Software License, Version 2.0',
    'Apache-2',
    'Apache Software License - Version 2.0',
    'Apache License Version 2.0',
    'Simplified BSD License,The Apache Software License, Version 2.0',
    'ASL',
  ],
  [
    'BSD 3-Clause',
    'BSD-3-Clause',
    '3-Clause BSD License',
    'BSD (3 clause)',
    'BSD 3-Clause License',
    '3-clause BSD <http://www.opensource.org/licenses/bsd-license.php>',
    'BSD 3-Clause License or Apache License, Version 2.0',
    'New BSD License',
    'new BSD License',
    'Modified BSD License',
  ],
  [
    'BSD-2-Clause',
    'BSD',
    'BSD-2-Clause or Apache-2.0',
    'BSD or Apache License, Version 2.0',
    'BSD License',
    'BSD license (see license.txt for details), Copyright (c) 2000-2018, ReportLab Inc.',
    'public domain, Python, 2-Clause BSD, GPL 3 (see COPYING.txt)',
  ],
  ['MPL-2.0', 'MPLv2.0, MIT Licences'],
  ['ISC', 'ISC license', 'ISC License', 'ISC License (ISCL)'],
  [
    'PSF License',
    'Python Software Foundation License',
    'PSF license',
    'PSF',
    'PSF or ZPL',
    'PSFL',
    'public domain, Python, 2-Clause BSD, GPL 3 (see COPYING.txt)',
  ],
  [
    'Public Domain',
    'Public domain',
    'public domain, Python, 2-Clause BSD, GPL 3 (see COPYING.txt)',
  ],
  ['GPL version 2', 'GPL v2'],
  ['LGPL version 2', 'LGPL v2'],
];

function buildApprovedLicenseSet(approvedLicenses: string[]) {
  let allLicenses = [...approvedLicenses];
  approvedLicenses.forEach((license) => {
    licenseVariants.forEach((variantGroup) => {
      if (variantGroup.includes(license)) {
        allLicenses = [...allLicenses, ...variantGroup];
      }
    });
  });
  return allLicenses.map((l) => l.toLocaleLowerCase().trim());
}

export function isLicenseApproved(
  license: string,
  approvedLicenses: string[]
): boolean {
  const allLicenses = buildApprovedLicenseSet(approvedLicenses);

  return license
    .split(/\sor\s/g)
    .map((l) => l.toLocaleLowerCase().trim())
    .some((l) => allLicenses.includes(l));
}
