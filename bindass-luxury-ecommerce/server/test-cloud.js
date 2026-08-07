const urls = [
  'https://res.cloudinary.com/demo/image/upload/sample.jpg',
  'https://res.cloudinary.com/demo/image/upload/v1234/sample.jpg',
  'https://res.cloudinary.com/demo/image/upload/c_fill,w_500/v1234/sample.jpg',
  'http://res.cloudinary.com/demo/image/upload/sample.jpg',
  'https://via.placeholder.com/150'
];

function robustCloudinary(url, additions) {
  if (!url || typeof url !== 'string') return url;
  let secureUrl = url.replace('http://', 'https://');
  if (!secureUrl.includes('res.cloudinary.com') || !secureUrl.includes('/upload/')) return secureUrl;

  // Split at /upload/
  const parts = secureUrl.split('/upload/');
  const base = parts[0] + '/upload/';
  let rest = parts[1];

  // If there are existing transformations, they usually don't have a slash or start with v followed by numbers
  // Cloudinary URL structure: .../upload/[transformations]/[version]/[public_id]
  
  // A robust way to just prepend a transformation safely without conflicting with strict transformations
  // is to actually just return the secureUrl if strict transformations are a concern,
  // OR we can safely add it. 
  // Wait, if strict transformations are enabled, ANY unapproved dynamic transformation fails.
  // The ONLY industry-compliant way is to do it at upload time, or use named transformations!
  return base + additions + '/' + rest;
}

urls.forEach(u => console.log(robustCloudinary(u, 'f_auto,q_auto')));
