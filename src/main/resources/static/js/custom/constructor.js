// TODO validation input
var DROPZONE_MESSAGE = 'Drop files here to upload';
var MANY_ELEMENT_IN_BLOCK = 'Too many elements';

 $(document).ready(function () {

    // setup toolbar and edit field
    var toolbar = $('#my-toolbar');

    $('.my-tool', toolbar).draggable({
        revert: 'invaid',
        helper: 'clone',
        containment: 'body',
        cancel: false
    });

    Dropzone.options.uploadArea = {
        url: 'https://api.cloudinary.com/v1_1/cloud9/image/upload',
        acceptedFiles:'.jpg,.png,.jpeg,.gif',
        uploadMultiple: false,
        maxFiles: 1,
        addRemoveLinks: true,
        dictDefaultMessage: DROPZONE_MESSAGE,
        init: function () {
            this.on('removedfile', function (file) {
                $('#photo-url').val('');
            });
            this.on('success', function (file, response) {
                $('#photo-url').val('http://res.cloudinary.com/itraphotocloud/image/upload/' + response.public_id + '.jpg');
            });
        },
        sending: function (file, xhr, formData) {
            formData.append('api_key', 891695265656755);
            formData.append('timestamp', Date.now() / 1000 | 0);
            formData.append('upload_preset', 'lrwcwlyh ');
        }
    };

     //FIXME placing many blocks disable!!!!!

    $(document.body).on('click', '.edit-element, .my-icon', function () {
        editElement($(this));
    });

    $(document.body).on('click', '.del-element', function () {
        $(this).closest('.my-element').remove();
    });

    $('#modal-video').on('click', '.btn-primary', function () {
        let root = $(this).closest('.modal');
        let config = {
            width: $('#video-width').val(),
            height: $('#video-height').val(),
            url: $('#video-url').val(),
            loop: $('#video-loop').prop('checked'),
            autoplay: $('#video-auto').prop('checked')
        };
        myRenderer.createMethods['video'](root.data('elementId'), config);
        root.modal('hide');
    });

    $('#modal-text').on('click', '.btn-primary', function () {
        let root = $(this).closest('.modal');
        let content = tinyMCE.get('text-area').getContent();
        myRenderer.createMethods['text'](root.data('elementId'), {text: content});
        root.modal('hide');
    });

     $('#modal-table').on('click', '.btn-primary', function () {
         let root = $(this).closest('.modal');
         let content = $('#chart-table').html();
         myRenderer.createMethods['table'](root.data('elementId'), {
             text: content,
             chart: $('#show-chart').prop('checked')
         });
         root.modal('hide');
     });

    $('#modal-photo').on('click', '.btn-primary', function () {
        let root = $(this).closest('.modal');
        let url = $('#photo-url').val();
        if (url.indexOf('res.cloudinary.com/itraphotocloud/image/upload') === -1) {
            $('.glyphicon-refresh-animate').removeClass('load-off');
            $.post('https://api.cloudinary.com/v1_1/cloud9/image/upload', {
                api_key: 891695265656755,
                timestamp: (Date.now() / 1000 | 0),
                upload_preset: 'lrwcwlyh',
                file: url
            })
                .done(function (response) {
                    _createPhoto('http://res.cloudinary.com/itraphotocloud/image/upload/' + response.public_id + '.jpg');
                })
                .fail(function (xhr, status, error) {
                    $('#photo-url').closest('.form-group').addClass('has-error');
                    $('.help-block').removeClass('hidden');
                })
                .always(function () {
                    $('.glyphicon-refresh-animate').addClass('load-off');
                });
            return;
        }

        function _createPhoto(cloudUrl) {
            let config = {
                width: $('#photo-width').val(),
                height: $('#photo-height').val(),
                url: cloudUrl
            };
            myRenderer.createMethods['image'](root.data('elementId'), config);
            Dropzone.instances[0].removeAllFiles();
            root.modal('hide');
        }

       _createPhoto(url);
    });

    $('.my-layout-set').on('click', function () {
        currentLayout = getLayoutFromId($(this).attr('id'));
        recreateLayout($('.my-container'), currentLayout);
    });

     var table = $('#chart-table');

     table.editableTableWidget();

     $('#modal-table').on('validate', 'table td:not(:first-child)', function (e, value) {
         if(!$.isNumeric(value)) {
             return false;
         }
     });

     $('#add-row').on('click', function () {
         $(table).find('tr:last').after('<tr><td tabindex="1">Item</td><td tabindex="1">5</td></tr>');
     });

     $('#delete-row').on('click', function () {
         $(table).find('tr:last:has(td)').remove();
     });

});

// config
var VIDEO_HEIGHT = 315;
var VIDEO_WIDTH = 560;
var MAX_ELEMENT_IN_BLOCK = 3;

var currentLayout = 0;

var baseElement = '\
            <div class="my-element">\
                <div class="toolbar">\
                    <a href="#" class="btn btn-info btn-sm edit-element" rel="tooltip" title="Settings">\
                        <span class="glyphicon glyphicon-cog" aria-hidden="true"></span>\
                    </a>\
                    <a href="#" class="btn btn-danger btn-sm del-element" rel="tooltip" title="Remove">\
                        <span class="glyphicon glyphicon-trash" aria-hidden="true"></span>\
                    </a>\
                </div>\
            </div>';

var DEFAULT_TABLE = '<thead><tr><th>Name</th><th>Value</th></tr></thead><tbody><tr><td tabindex="1">Item</td><td tabindex="1">5</td></tr></tbody>';

function recreateLayout(container, layoutId) {
    container.html('');
    generateGrid(container, myRenderer.layouts[layoutId]);
}

function generateGrid(container, rows) {

    myRenderer.renderGrid(container, rows);

    var editField = $('.my-content');

    editField.droppable({
        accept: '#my-toolbar > .my-tool',
        classes: {
            "ui-droppable-hover": "my-state-hover"
        },
        drop: function (event, ui) {
            addElement(ui.draggable, $(this));
        }
    });

    let shouldDelete = false;
    editField.sortable({
        cursor: 'move',
        connectWith: editField,
        containment: 'body',
        tolerance: 'pointer',
        // helper: function () {
        //     return '<div style="width: 100px; border: solid 5px #2b5a05">Helper</div>';
        // },
        over: function () {
            shouldDelete = false;
        },
        out: function () {
            shouldDelete = true;
        },
        beforeStop: function (event, ui) {
            if (shouldDelete == true) {
                ui.item.remove();
            }
        }
    });
}

var map = {};
map['text'] = '/images/text.png';
map['image'] = '/images/camera.png';
map['video'] = '/images/movie.png';
map['table'] = '/images/table.png';
map['comment'] = '';
map['rating'] = '';

var processElement = {};
processElement['image'] = function (element) {
    let data = element.find('img:not(.my-icon)').data('mySrc');
    return {
        width: data !== null ? data.width : 0,
        height: data !== null ? data.height : 0,
        url: data !== null ? data.url : ''
    }
};
processElement['text'] = function (element) {
    let data = element.find('.my-text-content');
    console.log(data);
    return {
        text: data.length !== 0 ? data.html() : ''
    }
};
processElement['video'] = function (element) {
    let video = element.find('iframe');
    return {
        width: video.length !== 0 ? video.attr('width') : 0,
        height: video.length !== 0 ? video.attr('height') : 0,
        url: video.length !== 0 ? video.data('mySrc') : '',
        autoplay: video.length !== 0 ? video.data('auto') : false,
        loop: video.length !== 0 ? video.data('loop') : false
    }
};
processElement['table'] = function (element) {
    let data = element.find('table');
    console.log(data);
    return {
        text: data.length !== 0 ? data.html() : '',
        chart: data.length !== 0 ? data.data('chart') : false
    }
};

function loadForEdit(element) {
    let type = element.type.$name.toLowerCase();
    let _element = map[type];
    myRenderer.loadElement(element, type, map[type]);
}

function saveElement(element) {
    let regex = /my-element my-([\w]+)/;
    let type = element.attr('class').match(regex)[1];
    let data = processElement[type](element);
    return {
        type: type,
        location:  $('.my-content').index(element.closest('.my-content')),
        width: data.width || 0,
        height: data.height || 0,
        url: data.url || '',
        text: data.text || '',
        autoplay: data.autoplay || false,
        loop: data.loop || false,
        chart: data.chart || false
    };
}

function addElement(item, container) {
    if (container.find('.my-element').length >= MAX_ELEMENT_IN_BLOCK) {
        customAlert(MANY_ELEMENT_IN_BLOCK);
        return;
    }
    let type = item.attr('id').slice(5); //FIXME loh
    let icon = map[type];
    container.append(myRenderer.createElement('my-' + type, true, icon));
}

function initWYSIWYG(locale) {
    tinymce.init({
        language: locale,
        selector: '#text-area',
        // auto_focus: '#text-area',
        // plugins: 'emoticons autolink wordcount contextmenu image imagetools link lists table textcolor colorpicker',
        // menubar: "file edit view insert table format",
        // toolbar: "undo redo | bold italic forecolor backcolor |  | image link table | formats",
        // contextmenu: "link image inserttable | cell row column deletetable",
        // contextmenu_never_use_native: true,
        // imagetools_toolbar: "rotateleft rotateright | flipv fliph | editimage imageoptions",
        // default_link_target: "_blank",
        browser_spellcheck: true
    });
}

function setDropzoneMessage(message) {
    DROPZONE_MESSAGE = message;
}

function setLocaleMessage(message) {
    message = message.replace('{0}', MAX_ELEMENT_IN_BLOCK);
    MANY_ELEMENT_IN_BLOCK = message;
}

function customAlert(message, title = '') {
    let alert = $('.my-notification');
    alert.find('strong').text(title);
    alert.find('p').text(message);
    alert.alert();
    alert.fadeTo(2000, 500).slideUp(500, function(){
        alert.slideUp(500);
    });
}

function getLayoutFromId(id) {
    let regex = /layout-([0-9]+)/;
    return id.match(regex)[1] - 1;
}

function editElement(e) {
    let element = e.closest('.my-element');
    let id = element.attr('class');
    if (id.indexOf('my-text') !== -1) {
        $('#modal-text').attr('data-element-id', element.attr('id'))
            .data('elementId', element.attr('id'));
        let text = element.find('.my-text-content');
        if (text.length) {
            tinyMCE.get('text-area').setContent(text.html());
        } else {
            tinyMCE.get('text-area').setContent('');
        }
        $('#modal-text').modal('show');
    } else if (id.indexOf('my-image') !== -1) {
        $('#modal-photo').attr('data-element-id', element.attr('id'))
            .data('elementId', element.attr('id'));
        let img = element.find('img:not(.my-icon)');
        if (img.length) {
            $('#photo-width').val(img.data('mySrc').width);
            $('#photo-height').val(img.data('mySrc').height);
            $('#photo-url').val(img.data('mySrc').url);
        } else {
            $('#photo-width').val(VIDEO_WIDTH);
            $('#photo-height').val(VIDEO_HEIGHT);
            $('#photo-url').val('');
        }
        $('#photo-url').closest('.form-group').removeClass('has-error');
        $('.help-block').addClass('hidden');
        Dropzone.instances[0].removeAllFiles();
        $('#modal-photo').modal('show');
    } else if (id.indexOf('my-video') !== -1) {
        $('#modal-video').attr('data-element-id', element.attr('id'));
        $('#modal-video').data('elementId', element.attr('id'));
        let frame = element.find('iframe');
        if (frame.length) {
            $('#video-width').val(frame.attr('width'));
            $('#video-height').val(frame.attr('height'));
            $('#video-url').val(frame.data('mySrc'));
            $('#video-auto').prop('checked', frame.data('auto'));
            $('#video-loop').prop('checked', frame.data('loop'));
        } else {
            $('#video-width').val(VIDEO_WIDTH);
            $('#video-height').val(VIDEO_HEIGHT);
            $('#video-url').val('');
            $('#video-auto').prop('checked', false);
            $('#video-loop').prop('checked', false);
        }
        $('#modal-video').modal('show');
    } else if (id.indexOf('my-table') !== -1) {
        $('#modal-table').attr('data-element-id', element.attr('id'));
        $('#modal-table').data('elementId', element.attr('id'));
        let table = element.find('table');
        if (table.length) {
            $('#chart-table').html(table.html());
            $('#show-chart').prop('checked', table.data('chart'));
        } else {
            $('#chart-table').html(DEFAULT_TABLE);
            $('#show-chart').prop('checked', false);
        }
        $('#modal-table').modal('show');
    } else if (id.indexOf('my-ratings') !== -1) {
    }
}
