module.exports = {
  ad: {
    url: process.env.AD_URL,
    baseDN: process.env.AD_BASE_DN,
    username: process.env.AD_USERNAME,
    password: process.env.AD_PASSWORD,
    domain: process.env.AD_DOMAIN || '.yourdomain.com',
    attributes: {
      user: [
        'cn',
        'mail',
        'userPrincipalName',
        'sAMAccountName',
        'memberOf',
        'givenName',
        'sn',
        'displayName',
        'title',
        'department'
      ]
    }
  }
};