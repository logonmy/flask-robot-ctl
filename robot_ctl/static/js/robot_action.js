(function () {
    var exp = {};
    window.ex = exp;
    var name = "x";
    exp.pgn_list = {};
    exp.make = function () {
        var modal = $('<div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">');
        var modal_dialog = $('<div class="modal-dialog">');
        var modal_content = $('<div class="modal-content">');
        var modal_head = $('<div class="modal-header">');
        var modal_title = $('<h4 class="modal-title" id="myModalLabel">').text('模态框（Modal）标题');
        modal_head.append(modal_title);
        var button_colse = $('<button type="button" class="close" data-dismiss="modal" aria-hidden="true">').text('x');
        modal_head.append(button_colse);
        modal_content.append(modal_head);
        var modal_body = $('<div class = "modal-body">').text('在这里添加一些文本');
        modal_content.append(modal_body);
        var modal_foot = $('<div class="modal-footer">');
        var modal_footer_button_close = $('<button type="button" class="btn btn-default" data-dismiss="modal">').text('关闭');
        modal_foot.append(modal_footer_button_close);
        var modal_footer_button_submit = $('<button type="button" class="btn btn-primary">').text('提交更改');
        modal_foot.append(modal_footer_button_submit);
        modal_content.append(modal_foot);
        modal_dialog.append(modal_content);
        modal.append(modal_dialog);
        $('#preload').append(modal);
    };

    exp.logout = function () {
        window.location.href = '/logout';
    }

    exp.makePageFootDeprecated = function (current, pages, pageVars) {
        if (pageVars == null) {
            pageVars = [];
            for (var i = 0; i < pages; i++)
                pageVars.push(i);
        }
        var foot = $('.pagefoot');
        foot.empty();
        //first
        var first = $('<div class="first">')
        first.append('<span>首页</span>');
        foot.append(first);
        //prev
        var prev = $('<div class="prev">')
        if (current > 1) {
            prev.append('<a href="javascript:ex.last()">上一页</a>');
        } else {
            prev.append('<span>上一页</span>');
        }
        foot.append(prev);

        for (var i = 1; i <= pages; i++) {
            var pageNoBlock = $('<div class="pageNoBlock">')
            var pageSpan = $('<span>');
            pageSpan.text(pageVars[i]);
            pageNoBlock.append(pageSpan);
            foot.append(pageNoBlock);
        }

        //next
        var next = $('<div class="next">');
        console.log(current);
        if (current < pages) {
            next.append('<a href="javascript:ex.next()">下一页</a>');
        } else {
            next.append('<span>下一页</span>');
        }
        foot.append(next);
        //last
        var last = $('<div class="last">')
        last.append('<span>末页</span>');
        foot.append(last);
    }

    exp.makePage = function (div, apiurlformat, renderfc) {
        var pgn = new Pagination(div, 10);
        pgn.format_url(apiurlformat);
        var pgnid = div.attr('id');
        exp.pgn_list[pgnid] = pgn;
        pgn.render(function (event) {
            renderfc(event, pgn, pgnid)
        });
        pgn.navi_to(1);
    }

    exp.to = function (pgnid, index, size) {
        console.log('act');
        var pgn = exp.pgn_list[pgnid];
        if (index < 1) index = 1;
        if (index > pgn.pages) index = pgn.pages;
        pgn.navi_to(index);
    }

    exp.now = function (fmt) { //author: meizz 
        if (fmt == null)
            fmt = 'yyyy-MM-dd HH:mm:ss';
        now = new Date();
        var o = {
            'M+': now.getMonth() + 1, //月份 
            'd+': now.getDate(), //日 
            'H+': now.getHours(), //小时
            'm+': now.getMinutes(), //分
            's+': now.getSeconds(), //秒
            'q+': Math.floor((now.getMonth() + 3) / 3), //季度
            'S': now.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (now.getFullYear() + '').substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp('(' + k + ')').test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
        return fmt;
    }
})();

$(document).ready(function () {
    let locations = {
        protocol: 'http:',
        port: 8081
    }
    let namespace = '/robot';
    var socket = io.connect(locations.protocol + '//' + document.domain + ':' + locations.port +
        namespace);
    socket.on('qq_group_msg', function (msg) {
        var group_msg = $('<div class="group_msg">')
        group_msg.text('[' + msg.data.member + '] - [' + msg.time + ']:' + msg.data.content)
        console.log('rec:' + ex.now());
        $('#recv_msg').append(group_msg);
    });

    $(document).on('keydown', '.inputarea', function (e) {
        // console.log(e.keyCode);
    })

    $('.sendbtn').attr('value','发送').text('发送');
    $(document).on('click', '.sendbtn', function () {
        var content = $('.inputarea').val()
        console.log('content:' + content);
        $.ajax({
            type: 'post',
            dataType: 'json',
            contentType: 'application/json; charset=UTF-8',
            //                        contentType: "application/json; charset=utf-8",
            url: '/api/qq/send/message/groups',
            data: JSON.stringify({
                'message': {
                    'content': content
                }
            }),
            context: $('.inputarea'),
            success: function (e) {

            },
        });
    });

    // ex.makePageFoot(1, 10, ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']);
    var makePageHtml = function (text, pgnid, pageindex, pagesize, disabled = false, active = false) {
        var link = $('<a class="btn" href="javascript:ex.to(\'' + pgnid + '\',' + pageindex + ',' + pagesize + ');">').text(text);
        var li = $('<li>').append(link);
        if (disabled) {
            if (!active)
                li.addClass('disabled');
            link.addClass('disabled');
            link.prop('disabled', true);
        }
        if (active)
            li.addClass('active')
        return li;
    };
    var makePageHtmlSpan = function (text, disabled = true) {
        var link = $('<a class="btn" href="#">').text(text);
        var li = $('<li>').append(link);
        if (disabled) {
            li.addClass('disabled');
            link.addClass('disabled');
            link.prop('disabled', true);
        }
        return li;
    };
    var makePageFooter = function (index, pages, size, pgnid) {
        var footer = $('<ul class="pagination">');

        if (pages > 7) {
            if (index > 1) {
                var elem = makePageHtml('1', pgnid, 1, size, index <= 1);
                footer.append(elem);
            }

            if ((index > 3 && index < pages) || index > 3) {
                var elem = makePageHtmlSpan('...');
                footer.append(elem);
            }

            if (index > pages - 1) {
                var to = index - 4;
                var elem = makePageHtml(to + '', pgnid, to, size, index <= 1);
                footer.append(elem);
            }

            if (index > pages - 2) {
                var to = index - 3;
                var elem = makePageHtml(to + '', pgnid, to, size, index <= 1);
                footer.append(elem);
            }

            if (index > pages - 3) {
                var to = index - 2;
                var elem = makePageHtml(to + '', pgnid, to, size, index <= 1);
                footer.append(elem);
            }

            if (index > 2) {
                var to = index - 1;
                var elem = makePageHtml(to + '', pgnid, to, size, index <= 1);
                footer.append(elem);
            }

            var elem = makePageHtml(index + '', pgnid, index, size, true, true);
            footer.append(elem);

            if (index < pages - 1) {
                var to = index + 1;
                var elem = makePageHtml(to + '', pgnid, to, size, index >= pages);
                footer.append(elem);
            }

            if (index < 4) {
                var to = index + 2;
                var elem = makePageHtml(to + '', pgnid, to, size, index >= pages);
                footer.append(elem);
            }

            if (index < 3) {
                var to = index + 3;
                var elem = makePageHtml(to + '', pgnid, to, size, index >= pages);
                footer.append(elem);
            }

            if (index < 2) {
                var to = index + 4;
                var elem = makePageHtml(to + '', pgnid, to, size, index >= pages);
                footer.append(elem);
            }

            if ((index < pages - 2 && index > 1) || pages > index + 3) {
                var elem = makePageHtmlSpan('...');
                footer.append(elem);
            }

            if (index < pages) {
                var to = pages;
                var elem = makePageHtml(to + '', pgnid, to, size, index >= pages);
                footer.append(elem);
            }
        } else {
            for (var i = 1; i <= pages; i++) {
                var to = i;
                var elem = makePageHtml(to + '', pgnid, to, size, i == index, i == index);
                footer.append(elem);
            }
            if (pages == 0) {
                var elem = makePageHtml('N', pgnid, to, size, true, false);
                footer.append(elem);
            }
        }
        return footer;
    }
    ex.makePage($('#qqpage'), '/api/qq/page/<index>?size=<size>',
        function (event, pgn, pgnid) {
            var ul_div = event.udiv;
            ul_div.empty();
            var manage = $('<div class="row" id="manage">');
            var add = $('<div class="col-sm-4">');
            add.append($('<button class="btn btn-primary btn-lg">').text('Add'));
            add.on('click', function () {
                var body = $('#myModal').find('div.modal-body');
                body.find('input#qqno').remove();
                var qqnoinput = $('<input id="qqno">').val('{"qq_no":"1234567","password":"123123"}');
                body.append(qqnoinput);
                console.log(body.html());
                $('#myModal').attr('hidePageid', pgnid);

                $('#myModal').modal({
                    keyboard: true
                });
                $(document).off('click', '#myModal div.modal-footer button.btn.btn-primary');
                $(document).on('click', '#myModal div.modal-footer button.btn.btn-primary', function (e) {
                    $('#myModal').modal('hide');
                    var hidpgid = $('#myModal').attr('hidePageid');
                    var text = $('#myModal button.btn-primary').text();
                    var body = $('#myModal').find('div.modal-body');
                    var input = body.find('input#qqno').val();
                    console.log('submit ' + hidpgid + ":" + text + ":" + input);
                    $.ajax({
                        type: 'post',
                        dataType: 'json',
                        //                        contentType: "application/json; charset=utf-8",
                        url: '/api/qq',
                        data: {
                            'qq': input
                        },
                        context: $('#myModal'),
                        success: function (e) {
                            pgn.navi_to(1);
                        },
                    });
                });
            });
            manage.append(add);
            var del = $('<div class="col-sm-4">');
            del.append($('<a class="btn btn-primary btn-lg">').text('Del'));
            del.on('click', function (e) {
                var lis = $('#qqpage li input:checked').parent();
                var del_nos = [];
                for (var i = 0; i < lis.length; i++) {
                    var li = lis[i];
                    var value = $(li).find('input[data_value]').attr('data_value');
                    del_nos.push(value);
                }
                $.ajax({
                    type: 'delete',
                    dataType: 'json',
                    //                        contentType: "application/json; charset=utf-8",
                    url: '/api/qq/' + del_nos,
                    context: $('#myModal'),
                    success: function (e) {
                        pgn.navi_to(1);
                    },
                });
            })
            manage.append(del);
            var login = $('<div class="col-sm-4">');
            login.append($('<a class="btn btn-primary btn-lg disabled">').text('Login'));
            login.on('click', function (e) {
                //TODO: 批量登录
                return;
                // var qqnoelems = $('.QQli .QQNo').toArray();
                // var qqnoelems = $('.QQli input:checkbox:not(:checked)').toArray();
                var qqnoelems = $('.QQli input:checkbox:checked').toArray();
                var qqnos = [];
                qqnoelems.forEach(qq => {
                    var qqno = $(qq).attr('data_value');
                    qqnos.push(qqno);
                    // login qq
                    return;
                    $.ajax({
                        type: 'post',
                        dataType: 'json',
                        contentType: 'application/json; charset=UTF-8',
                        //                        contentType: "application/json; charset=utf-8",
                        url: '/api/qq/login/'+qqno,
                        context: $(qq),
                        success: function (e,v,t) {
                            console.log("login response:"+e+":"+v+":"+t);
                            var popimg = $('#popimg');
                            console.log(popimg.length);
                            if(popimg.length == 0) {
                                var newpopimg = $('<img>').attr({'id':'popimg','src':'e'}).hide();
                                $('body').append(newpopimg);
                                console.log($('#popimg').length);
                                popimg = newpopimg;
                            }
                            popimg.show();
                            popimg.src = e;
                        },
                    });
                });
                console.log(qqnos);
            });
            manage.append(login);
            ul_div.append(manage);
            var ul = $('<ul class="nop QQul">');
            var index = event.json.index;
            var pages = event.json.pages;
            var items = event.json.items;
            pgn.re_paginate(index, pages);

            items.forEach(item => {
                var li = $('<li class="QQli">');
                li.attr('data-id', item.id);
                var QQicon = $('<div class="QQicon">');
                li.append(QQicon);
                var QQNo = $('<div class="QQNo">');
                QQNo.text(item.qq_no);
                li.append(QQNo);
                var checker = $('<input type="checkbox">').attr('data_value', item.qq_no);
                // $('#qqpage li input:checked').parent();
                li.append(checker);
                var loginbtn = $('<a class="btn btn-primary btn-lg" style="float:right;">');
                loginbtn.on('click', function (e) {
                    var qqno = $(this).siblings('input').attr('data_value');
                    // return;
                    $.ajax({
                        type: 'post',
                        dataType: 'json',
                        contentType: 'application/json; charset=UTF-8',
                        //                        contentType: "application/json; charset=utf-8",
                        url: '/api/qq/login/' + qqno,
                        context: $(this).siblings('input'),
                        success: function (e,v,t) {
                            $(this).prop("checked", true);
                            console.log("login response:"+e+":"+v+":"+t);
                            var popimg = $('#popimg');
                            console.log(popimg.length);
                            if(popimg.length == 0) {
                                var imgback = $('<div>').attr({'id':'popimg'}).addClass('imgBack').hide();
                                var imgclose = $('<div>').attr({'id':'popclose'}).addClass('imgClose');
                                imgclose.on('click',function(){
                                    $('#popimg').hide();
                                });
                                var newpopimg = $('<img>').attr({'src':'e'}).addClass('imgFore');
                                imgback.append(newpopimg);
                                imgback.append(imgclose);
                                $('body').append(imgback);
                                console.log($('#popimg').length);
                                popimg = imgback;
                            }
                            popimg.find('img').attr('src',e);
                            popimg.show();
                        },
                    });
                });
                loginbtn.text('Login');
                li.append(loginbtn);
                // console.log(JSON.stringify(item));
                ul.append(li);
            });
            ul_div.append(ul);

            var footer = makePageFooter(index, pages, pgn.size, pgnid);

            ul_div.append(footer);
        });
    ex.makePage($('#wxpage'), '/api/wx/page/<index>?size=<size>',
        function (event, pgn, pgnid) {
            var ul_div = event.udiv;
            ul_div.empty();

            var manage = $('<div class="row" id="manage">');
            var add = $('<div class="col-sm-6">');
            add.append($('<button class="btn btn-primary btn-lg">').text('Add'));
            add.on('click', function () {
                var body = $('#myModal').find('div.modal-body');
                body.find('input#qqno').remove();
                var qqnoinput = $('<input id="qqno" placeholder="/api/wx">');
                body.append(qqnoinput);
                console.log(body.html());
                $('#myModal').attr('hidePageid', pgnid);

                $('#myModal').modal({
                    keyboard: true
                });
                $(document).off('click', '#myModal div.modal-footer button.btn.btn-primary');
                $(document).on('click', '#myModal div.modal-footer button.btn.btn-primary', function (e) {
                    $('#myModal').modal('hide');
                    var hidpgid = $('#myModal').attr('hidePageid');
                    var text = $('#myModal button.btn-primary').text();
                    var body = $('#myModal').find('div.modal-body');
                    var input = body.find('input#qqno').val();
                    console.log('submit ' + hidpgid + ":" + text + ":" + input);
                });
            });
            manage.append(add);
            var del = $('<div class="col-sm-6">');
            del.append($('<a class="btn btn-primary btn-lg">').text('Del'));
            manage.append(del);
            ul_div.append(manage);

            var ul = $('<ul class="nop QQul">');
            var index = event.json.index;
            var pages = event.json.pages;
            var items = event.json.items;
            console.log(event.json);
            pgn.re_paginate(index, pages);

            items.forEach(item => {
                var li = $('<li class="QQli">');
                li.attr('data-id', item.id);
                var QQicon = $('<div class="QQicon">');
                li.append(QQicon);
                var QQNo = $('<div class="QQNo">');
                QQNo.text(item.wx_name);
                li.append(QQNo);
                // console.log(JSON.stringify(item));
                ul.append(li);
            });
            ul_div.append(ul);

            var footer = $('<ul class="pagination">');

            footer = makePageFooter(index, pages, pgn.size, pgnid);
'"' +
            ul_div.append(footer);
        });
    console.log(ex.make());
});