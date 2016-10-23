<?php
/**
 * Jetpack Compatibility File.
 *
 * @link https://jetpack.me/
 *
 * @package Shoreditch
 */

/**
 * Jetpack setup function.
 *
 * See: https://jetpack.me/support/infinite-scroll/
 * See: https://jetpack.me/support/featured-content/
 * See: https://jetpack.me/support/responsive-videos/
 * See: https://jetpack.me/support/social-menu/
 * See: https://jetpack.me/support/custom-content-types/#testimonials
 */
function shoreditch_jetpack_setup() {
	// Add theme support for Infinite Scroll.
	add_theme_support( 'infinite-scroll', array(
		'container'      => 'main',
		'render'         => 'shoreditch_infinite_scroll_render',
		'footer'         => 'page',
		'footer_widgets' => array(
			'sidebar-2',
			'sidebar-3',
		),
	) );

	//Add theme support for Featured Content.
	add_theme_support( 'featured-content', array(
		'filter'      => 'shoreditch_get_featured_posts',
		'description' => esc_html__( 'The featured content section displays on the index page bellow the header.', 'shoreditch' ),
		'max_posts'   => 6,
		'post_types'  => array( 'post', 'page' ),
	) );

	// Add theme support for Responsive Videos.
	add_theme_support( 'jetpack-responsive-videos' );

	// Add theme support for Social Menu.
	add_theme_support( 'jetpack-social-menu' );

	// Add theme support for Testimonials.
	add_theme_support( 'jetpack-testimonial' );
}
add_action( 'after_setup_theme', 'shoreditch_jetpack_setup' );

/**
 * Custom render function for Infinite Scroll.
 */
function shoreditch_infinite_scroll_render() {
	while ( have_posts() ) {
		the_post();
		if ( is_search() ) {
			get_template_part( 'template-parts/content', 'search' );
		} else if ( is_post_type_archive( 'jetpack-testimonial' ) ) {
			get_template_part( 'template-parts/content', 'testimonial' );
		} else {
			get_template_part( 'template-parts/content', get_post_format() );
		}
	}
}

/**
 * Featured Posts.
 */
function shoreditch_has_multiple_featured_posts() {
	$featured_posts = apply_filters( 'shoreditch_get_featured_posts', array() );
	if ( is_array( $featured_posts ) && 1 < count( $featured_posts ) ) {
		return true;
	}
	return false;
}
function shoreditch_get_featured_posts() {
	return apply_filters( 'shoreditch_get_featured_posts', false );
}

/**
 * Return early if Social Menu is not available.
 */
function shoreditch_social_menu() {
	if ( ! function_exists( 'jetpack_social_menu' ) ) {
		return;
	} else {
		jetpack_social_menu();
	}
}

/**
 * Testimonials Title.
 */
function shoreditch_testimonials_title( $before = '', $after = '' ) {
	$jetpack_options = get_theme_mod( 'jetpack_testimonials' );
	$title = esc_html__( 'Testimonials', 'shoreditch' );
	if ( isset( $jetpack_options['page-title'] ) && '' != $jetpack_options['page-title'] ) {
		$title = esc_html( $jetpack_options['page-title'] );
	}
	echo $before . $title . $after;
}

/**
 * Testimonials Content.
 */
function shoreditch_testimonials_content( $before = '', $after = '' ) {
	$jetpack_options = get_theme_mod( 'jetpack_testimonials' );
	if ( isset( $jetpack_options['page-content'] ) && '' != $jetpack_options['page-content'] ) {
		$content = convert_chars( convert_smilies( wptexturize( stripslashes( wp_filter_post_kses( addslashes( $jetpack_options['page-content'] ) ) ) ) ) );
		echo $before . $content . $after;
	}
}

/**
 * Testimonials Featured Image.
 */
function shoreditch_testimonials_image() {
	$jetpack_options = get_theme_mod( 'jetpack_testimonials' );
	if ( isset( $jetpack_options['featured-image'] ) && '' != $jetpack_options['featured-image'] ) {
		$image = wp_get_attachment_image_src( (int)$jetpack_options['featured-image'], 'post-thumbnail' );
		printf( ' style="background-image: url(\'%s\');"', esc_url( $image[0] ) );
	}
}

/**
 * Load Jetpack scripts.
 */
function shoreditch_jetpack_scripts() {
	if ( is_home() && ! is_paged() && ! empty( shoreditch_get_featured_posts() ) ) {
		wp_register_script( 'shoreditch-flexslider', get_template_directory_uri() . '/vendor/flexslider/jquery.flexslider.min.js', array( 'jquery' ), '2.6.0', true );

		$suffix = ( defined( 'SCRIPT_DEBUG' ) && true === SCRIPT_DEBUG ) || isset( $_GET['script_debug'] ) ? '' : '.min';

		wp_enqueue_script( 'shoreditch-featured-content', get_template_directory_uri() . "/assets/scripts/featured-content{$suffix}.js", array( 'shoreditch-flexslider' ), filemtime( get_template_directory() . "/assets/scripts/featured-content{$suffix}.js" ), true );
	}
}
add_action( 'wp_enqueue_scripts', 'shoreditch_jetpack_scripts' );
