feedlist = []


class QQFeed(object):
    qqno = None
    callBack = None
    funcName = None
    qrCallBack = None
    qrFuncName = None

    def __init__(self, qqno):
        self.qqno = qqno
        feedlist.append(self)

    def __del__(self):
        feedlist.remove(self)

    @staticmethod
    def loginFeed(authStatus):
        for feed in feedlist:
            if feed.callBack is not None:
                getattr(feed.callBack, feed.funcName)(feed.qqno, authStatus)

    @staticmethod
    def qrfeed(qrcode):
        for feed in feedlist:
            if feed.qrCallBack is not None:
                getattr(feed.qrCallBack, feed.qrFuncName)(feed.qqno, qrcode)

    def feedback(self, callback, funcname):
        self.callBack = callback
        self.funcName = funcname

    def qrback(self, qrback, funcname):
        self.qrCallBack = qrback
        self.qrFuncName = funcname
