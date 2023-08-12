<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the web site, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://wordpress.org/documentation/article/editing-wp-config-php/
 *
 * @package WordPress
 */

// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'RightTravelsConsultant' );

/** Database username */
define( 'DB_USER', 'root' );

/** Database password */
define( 'DB_PASSWORD', '' );

/** Database hostname */
define( 'DB_HOST', 'localhost' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8mb4' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         '4vq( leL=`+CtX5Dx63qDs?t9Qck6!3~wAWK1Xe[v~q|@=N6xhU-]C-65}<4_?zU' );
define( 'SECURE_AUTH_KEY',  'K}$Wyy{|/%5>lhX-.X0z}f-BQ?5y#9;u~5XR))?Y}WK(aZzRJ^$NZ/$9Kh!&a5xp' );
define( 'LOGGED_IN_KEY',    'Dy~UpZB8TF/ /M;ua8[e)ybkYdm#[*1>KUpg+sG,L-u$z@aJ]i80h.$7^{dqR~3*' );
define( 'NONCE_KEY',        'ere*6f60e/vIxaMe/[FJ p=!AMYgGlm;|+T`&}IESbgu+7/VgyTut*H.=>?`OdI=' );
define( 'AUTH_SALT',        'ihetyqB$IS#vI-XHn%M6K^I`B)tZZ)~P>RcNGJ_+4S:-;c[no1]W/I{tRpNNW+Md' );
define( 'SECURE_AUTH_SALT', '0fbCN S7r}fy+<UJv Ke/D47iQO;jR[zA/!5tciF>KMc1+M4rhT(wE[,DW$G,XF?' );
define( 'LOGGED_IN_SALT',   'dfTI:C#H$}RHhJLz)[WJ;JyxBOjH5iG1s&[qo{yrVb(`vnGd|H-(A:s9oM4}XD:-' );
define( 'NONCE_SALT',       'cN^M#`WT]i9fo~ZDbYWUS>F{:K@JTtWepnlt9wT>i.;J>:OR*p^k!#/[xRYr^e;+' );

/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://wordpress.org/documentation/article/debugging-in-wordpress/
 */
define( 'WP_DEBUG', false );

/* Add any custom values between this line and the "stop editing" line. */



/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
