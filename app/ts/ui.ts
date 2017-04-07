/// <reference path="../../node_modules/@types/jquery/index.d.ts" />

namespace UI {
	export function Loading(): void {
		Overlay();
		$('<div id="loading" />').appendTo('body');
		$("#loading").addClass("centered");
		$("#loading").append('<div>Loading...</div>');
	}
	export function LoadingOff(): void {
		OverlayOff();
		$("#loading").remove();
	}
	export function Overlay(): void {
		$('<div id="overlay"></div>').appendTo('body'); // style="display: none;"
	}
	export function OverlayOff(): void {
		$("#overlay").remove();
	}

	export function Game(pixiview: Element): void {
		$('<div id="game" />').appendTo('body');

		// Map holder
		$('<div id="map-column" />').appendTo($("#game"));
		$("#map-column").append(pixiview);

		// Right column
		$('<div id="right-column" />').appendTo($("#game"));
		$("#right-column").append('<div>:3</div>');
	}
	export function GameOff(): void {
		$("#game").remove();
	}
	export function TextsToRight(texts: string[]): void {
		$("#right-column").empty();
		texts.forEach(text => $("#right-column").append('<div>' + text + '</div>'));	
	}
}