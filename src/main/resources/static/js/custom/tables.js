var _rates = {};

var layout = 4;
var height = 130;
var itemsInPage = 6;

function initTables(siteList, user, locale, small) {
    moment.locale(locale);

    if (small) {
        layout = 3;
        height = 80;
        itemsInPage = 8;
    }

    siteList.bind('dynatable:afterUpdate', function(e, dynatable){
        $('.rating-loading').rating({
            step: 0.5,
            displayOnly: true,
            size: 'xs'
        });
    });

    $.get('/api/rates.json', {user: user}, function (response, status) {
        loadContent(siteList, response, user);
    });
}

function loadContent(siteList, rates, user) {
    _rates = rates;
    $.get('/api/sites.json', {user: user}, function (response, status) {
        if (response.length === 0) {
            return;
        }
        siteList.dynatable({
            table: {
                bodyRowSelector: '.site-thumb'
            },
            dataset: {
                records: response,
                perPageDefault: itemsInPage
            },
            writers: {
                _rowWriter: rowWriter
            },
            readers: {
                _rowReader: rowReader
            },
            params: {
                records: 'sites'
            }
        });

        $('#dynatable-query-search-site-list').addClass('form-control').attr('placeholder', 'Search');
        $('#dynatable-search-site-list')
            .contents().filter(function () {
            return this.nodeType === 3;
        }).remove();
        $('.dynatable-per-page').remove();

    });
}

function rowWriter(rowIndex, record, columns, cellWriter) {
    let creationDate = moment(record.creationDate).format("D MMMM YYYY");

    return '<div class="col-sm-4 col-md-' + layout + ' site-thumb">\
                    <div class="post">\
                        <div class="post-img-content">\
                            <a href="/sites/' + record.id + '">\
                                <img src="http://res.cloudinary.com/itraphotocloud/image/upload/c_pad,w_460,h_250/' + record.logo + '.png"\
                                class="img-responsive" />\
                                <span class="post-title"><b>' + record.name + '</b><br />\
                                <!--<b>CSS3 Blur</b>--></span>\
                            </a>\
                        </div>\
                        <div class="content">\
                            <div class="author" style="text-align: center">\
                                <time datetime="2014-01-20">' + creationDate + '</time>\
                            </div>\
                            <table>\
                                <tr>\
                                    <td>\
                                        <input name="rating" value="' + _rates[record.id] + '" class="rating-loading"/>\
                                    </td>\
                                    <td style="padding-left: 20px">\
                                        <em>' + record.rates.length + '  votes</em>\
                                    </td>\
                                </tr>\
                            </table>\
                            <div style="overflow: hidden; height: ' + height + 'px;">' + record.description + '\
                            </div>\
                        </div>\
                    </div>\
                </div>';
}
function rowReader(index, li, record) {

}





