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
define( 'AUTH_KEY',         'X:SyZe>0!V&##R=n9jN0 um,S@;y{B~wXp:EcYMS;8r;_[?$q6 P>Da]m!5K(ZCM' );
define( 'SECURE_AUTH_KEY',  'bKem][{Wy.[XA5(/)R*ah;Ja!x_;L/5U)mYG84WTCl:-wxLW80vdjlMONev8]%c9' );
define( 'LOGGED_IN_KEY',    '*]}t n}R*I1Di& B+XgaOG?wJ_#(Y2e }3H]2[^pO]C$AwG<7i]^]vbkvQ1xnAZ.' );
define( 'NONCE_KEY',        'IWQJ&9 .pL7A<k3PS_9@ZLiPu~a`.R/mD(]#Ej+qP!K(DA9>GUjhy,!Qn&X7so7I' );
define( 'AUTH_SALT',        'a]Y^S qwN%|AhV!AEWIv=0GTT2s2k=?Vz/+IiY&<0,Ne,Yz0/IAZpg*hl@/@c9!&' );
define( 'SECURE_AUTH_SALT', 'R!eqTE]c7aG<W{$1i/?TFnKP=[zE M<[{4!zkhd(0elX[-tRB6ra#X`m @=C*KDi' );
define( 'LOGGED_IN_SALT',   '@+k1,Ti<Bd8}wqso ZE3<fL0f^q9ENuxQs8pDrO-ubU |gkB_)yb!ia@>oLmT*7c' );
define( 'NONCE_SALT',       '3*eSRfn,%fhTZ2HYgbC[?=}6~k/HSE<Ha@bwM^-Sa:f!HF=2A$ON0uz?_/t:T8X*' );

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
