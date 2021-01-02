import constants from "../constants.js";

export default class UserFrame extends Application {

    currentUser = undefined;
    currentCharacter = undefined;

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "user-frame-ui",
            template: `${constants.modulePath}/templates/hud/user-frame-ui.hbs`,
            popOut: false
        });
    }

    /** @override */
    getData(options = {}) {
        options = super.getData(options);
        options.character = this.currentCharacter;

        if (this.currentCharacter) {
            options.hp = this.getCharacterHP(this.currentCharacter);
            options.ss = this.getSpellSlots(this.currentCharacter);
            options.xp = this.currentCharacter.data.data.details.xp;
            options.image = this.currentCharacter.data.img;
            options.ac = this.getCharacterAC(this.currentCharacter);
            options.resources = this.getResources(this.currentCharacter);
            options.torchActive = (this.currentCharacter.data.data.torchActive);
        }


        console.log(options);
        return options;
    }

    init(user) {
        this.currentUser = user;

        if (this.currentUser.isGM) {
            this.loadCharacter(this.currentUser.character);
        } else {
            this.loadCharacter(this.currentUser.character);
        }

        ui.userFrames = this;
        this.render(true);
    }

    loadCharacter(character) {
        this.currentCharacter = character;

    }

    updateUIHP(character) {
        if (character.id === this.currentCharacter.id) {
            var hp = this.getCharacterHP(character);
            $('#player-hp .current').html(hp.current + ' / ' + hp.max)
            if (hp.pos) {
                $('#player-hp').css('background', 'linear-gradient(rgb(45, 0, 0) ' + hp.percentage + '%, rgb(229, 0, 0) ' + hp.percentage + '%)');
            } else {
                $('#player-hp').css('background', 'linear-gradient(rgb(119, 119, 119) ' + hp.percentage + '%, rgb(45, 0, 0) ' + hp.percentage + '%)');
            }
        }
    }

    getCharacterHP(character) {
        var attributes = this.currentCharacter.data.data.attributes;
        var max = attributes.hp.max;
        var min = attributes.hp.min;
        var value = attributes.hp.value;
        if (attributes.hp.tempmax) max = attributes.hp.tempmax;
        if (value > max) value = max;
        var pos = false;
        if (value > min) pos = true;
        var percentage = this.getPercentage(value, max, pos);

        var hp = {
            current: value,
            max: max,
            min: min,
            pos: pos,
            percentage: 100 - percentage
        }
        return hp;
    }

    updateUIAC(character) {
        if (character.id === this.currentCharacter.id) {
            var ac = this.getCharacterAC(character);
            $('#player-ac .current').html(ac)
        }
    }

    getCharacterAC(character) {
        var attributes = this.currentCharacter.data.data.attributes;
        return attributes.ac.value;
    }

    updateUIImage(character){
        if (character.id === this.currentCharacter.id) {
            var img = this.currentCharacter.data.img;
            var pImg = $('#player-image img');
            pImg.attr('src', '/' + img);
        }
    }

    updateUIXP(character) {
        
        if (character.id === this.currentCharacter.id) {
            var xp = this.currentCharacter.data.data.details.xp;
            var bar = $('.experience-container .experience-bar');
            bar.css('width', xp.pct + '%');
        }
    }

    updateUISpellSlots(character) {
        if (character.id === this.currentCharacter.id) {
            var spellSlots = this.getSpellSlots(character);
            for (var i = 1; i < 10; i++) {
                $('.player-spell-slot').css('display', 'none');
            }

            for (var i = 1; i < 10; i++) {
                var spellSlot = spellSlots['ss' + i];
                if (spellSlot) {
                    $('#player-ss-' + i).css('background', 'linear-gradient(#0A3751 ' + spellSlot.percentage + '%, #33B5FF ' + spellSlot.percentage + '%)');
                    $('#player-ss-' + i + ' .count').html(spellSlot.current);
                    $('#player-ss-' + i).css('display', 'table');
                }
            }
        }
    }

    getSpellSlots(character) {
        var spells = this.currentCharacter.data.data.spells;

        var spellSlots = {};
        for (var i = 1; i < 10; i++) {
            var spellSlot = spells['spell' + i];
            if (spellSlot && spellSlot.max > 0) {
                var max = spellSlot.max;
                var value = spellSlot.value;
                var percentage = this.getPercentage(value, max, true);
                spellSlots['ss' + i] = {
                    current: value,
                    max: max,
                    percentage: 100 - percentage
                }
            }
        }
        return spellSlots;
    }

    getPercentage(value, max, pos) {
        var percentage = 0;
        if (pos) {
            percentage = parseInt((value / max) * 100);
        } else {
            var v = 0;
            if (value < 0) {
                v = max + value;
            } else {
                v = max - value;
            }
            percentage = parseInt((v / max) * 100);
        }
        return percentage;
    }

    updateUIResources(character){
        var resources = this.getResources(character);
        $('#player-resources').empty();
        resources.forEach(function(resource){
            $('#player-resources').append(`<div class="resource ${resource.class}">
            <span class="label">${resource.text}</span>
            <div class="bar"
        style="background:linear-gradient(to right, ${resource.light} ${resource.percentage}%, ${resource.dark} ${resource.percentage}%)">
                <div class="current">
                    ${resource.current} / ${resource.max}
                </div>
            </div>
        </div>`);

        });
        
    }

    getResources(character){
        var resources = character.data.data.resources;

        var data = [];
        if(resources.primary.label && resources.primary.label.length > 0){
            data.push({
                text: resources.primary.label,
                current: resources.primary.value,
                max: resources.primary.max,
                percentage: this.getPercentage(resources.primary.value, resources.primary.max, true),
                class: 'primary',
                light: '#33B5FF',
                dark: '#0A3751'
            });
        }

        if(resources.secondary.label && resources.secondary.label.length > 0){
            data.push({
                text: resources.secondary.label,
                current: resources.secondary.value,
                max: resources.secondary.max,
                percentage: this.getPercentage(resources.secondary.value, resources.secondary.max, true),
                class: 'secondary',
                light: '#33ff3d',
                dark: '#1e510a'
            });
        }

        if(resources.tertiary.label && resources.tertiary.label.length > 0){
            data.push({
                text: resources.tertiary.label,
                current: resources.tertiary.value,
                max: resources.tertiary.max,
                percentage: this.getPercentage(resources.tertiary.value, resources.tertiary.max, true),
                class: 'tertiary',
                light: '#3385ff',
                dark: '#0a1d51'
            });
        }

        return data;
    }

    torchClick() {
        console.log(this.currentCharacter);
        const actor = game.actors.entities.find(actor => actor.id === this.currentCharacter.data._id);
        var active = (this.currentCharacter.data.data.torchActive);
        UserFrame.setTorchActive(actor, !active);

        const token = canvas?.tokens?.placeables?.find(t => t.actor.id === actor.id) ?? null;
        const torches = actor.items.find(i => i.type === 'consumable' && i.name === 'Torch');

        if(active){
            $('#player-torch').removeClass('on').addClass('off');
            if(token){
                token.update({
                    brightLight: 0,
                    dimLight: 0
                });

            }
            
        } else{
            if(torches){
                $('#player-torch').removeClass('off').addClass('on');
                if(token){
                    token.update({
                        brightLight: 20,
                        dimLight: 40
                    });
                    torches.delete();
                }
            }
            
            
        }
    }

    static async setTorchActive(actor, active) {
        return await actor.update({
            "data.torchActive": active
        });
    }
}