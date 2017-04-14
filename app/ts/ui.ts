/// <reference path="input/input.ts" />
/// <reference path="../../node_modules/@types/jquery/index.d.ts" />

namespace IslandIV {
	export namespace UI {
		
		
		export function Loading(): void {
			if ($("#loading").length) return;
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
			if ($("#overlay").length) return;
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

		export function MessageWindow(title: string, text?: string): void {
			if ($("#message-window").length) return;
			PopupWindow("message-window", title, text);
		}

		export function QueryWindow(title: string, cb: () => void, text?: string) {
			if ($("#query-window").length) return;
			PopupWindow("query-window", title, text);
			$('.button-row').prepend('<button id="okButton">Yes</button>');
			$('#okButton').click(() => {
				PopupWindowOff("query-window");
				cb();
			});
			$('#okButton').focus();
		}

		export function PopupWindow(id: string, title: string, text?: string): void {
			Overlay();
			Input.WindowKeys();
			$('<div id="' + id + '"/>').appendTo('body');
			$('#' + id).addClass("centered").addClass("pop-up");
			$('#' + id).text(title);
			if (text !== undefined) $('#' + id).append('<div style="color: grey">' + text + '</div>');
			$("#" + id).keyup(keyevent => { if(keyevent.keyCode == 27) PopupWindowOff(id); });
			$('#' + id).append('<div class="button-row"><button id="closeButton">Close</button></div>');
			$('#closeButton').click(() =>	PopupWindowOff(id));
			$('#closeButton').focus();	
		}
		export function PopupWindowOff(id: string): void {
			OverlayOff();
			Input.WindowKeysOff();
			$("#" + id).remove();
		}

		/*
		$("#namegiving").append('<div style="text-align: center; color: grey">Give name to your character:</div>');
		$("#namegiving").append('<div id="input_holder" class= "selectable selected"><input id="name_input" type="text" placeholder="Ahto Simakuutio" maxlength="16"></div>');
		$("#name_input").focus(); */
	}
}