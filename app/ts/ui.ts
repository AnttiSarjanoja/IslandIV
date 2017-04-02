/// <reference path="../../node_modules/@types/jquery/index.d.ts" />

namespace UI {
	export function Loading() {
		Overlay();
		$('<div id="loading" />').appendTo('body');
		$("#loading").addClass("centered");
		$("#loading").append('<div>Loading...</div>');
	}
	export function LoadingOff() {
		OverlayOff();
		$("#loading").remove();
	}
	export function Overlay() {
		$('<div id="overlay"></div>').appendTo('body'); // style="display: none;"
	}
	export function OverlayOff() {
		$("#overlay").remove();
	}

	export function Game(pixiview: Element) {
		$('<div id="game" />').appendTo('body');

		// Map holder
		$('<div id="map-column" />').appendTo($("#game"));
		$("#map-column").append(pixiview);

		// Right column
		$('<div id="right-column" />').appendTo($("#game"));
		$("#right-column").append('<div>Loading...</div>');
	}
	export function GameOff() {
		$("#game").remove();
	}
}