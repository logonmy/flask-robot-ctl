from datetime import date, datetime
import json

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Column, Integer, String

from robot_ctl.logger import getLogger

db = SQLAlchemy()

logger = getLogger(__name__)


def init_app(app):
    db.init_app(app)
    return db


def get_db_session():
    return db.session


class QQ(db.Model):
    __tablename__ = 'qq_list'

    id = Column('id', Integer, primary_key=True)
    qq_no = Column('qq_no', String(20))
    password = Column('password', String(128))
    create_time = Column('create_time', String(128))
    update_time = Column('update_time', String(128))

    def __init__(self, id, qq_no, password, create_time, update_time):
        self.id = id
        self.qq_no = qq_no
        self.password = password
        self.create_time = create_time
        self.update_time = update_time

    def __repr__(self):
        return '<id is %s, username is %s, password is %s, create time is %s, update time is %s>' % (
            self.id, self.qq_no, self.password, self.create_time, self.update_time)


class Wx(db.Model):
    __tablename__ = 'wx_list'

    id = Column('id', Integer, primary_key=True)
    wx_no = Column('wx_no', String(20))
    wx_name = Column('wx_name', String(20))
    password = Column('password', String(128))
    create_time = Column('create_time', String(128))
    update_time = Column('update_time', String(128))

    def __init__(self, id, wx_no, wx_name, password, create_time, update_time):
        self.id = id
        self.wx_no = wx_no
        self.wx_name = wx_name
        self.password = password
        self.create_time = create_time
        self.update_time = update_time

    def __repr__(self):
        return '<id is %s, wx_no is %s, wx_name is %s, password is %s, create time is %s, update time is %s>' % (
            self.id, self.wx_no, self.wx_name, self.password, self.create_time, self.update_time)


def NoneWrap(_func_):
    def inner(*args, **kwargs):  # 1
        try:
            print "Arguments were: %s, %s" % (args, kwargs)
            ret = _func_(*args, **kwargs)  # 2
            return ret
        except Exception as e:
            logger.debug('noneWrap:' + e.message)
            return None

    return inner


class Generator:
    @staticmethod
    @NoneWrap
    def makeWx(wx):
        return {
            'id': wx.id,
            'wx_no': wx.wx_no,
            'wx_name': wx.wx_name,
            'password': wx.password,
            'create_time': wx.create_time.strftime('%Y-%m-%d %H:%M:%S'),
            'update_time': wx.update_time.strftime('%Y-%m-%d %H:%M:%S'),
        }

    @staticmethod
    @NoneWrap
    def makeWxList(wxs):
        list = []
        for wx in wxs:
            list.append(Generator.makeWx(wx))
        return list

    @staticmethod
    @NoneWrap
    def makeQQ(qq):
        return {
            'id': qq.id,
            'qq_no': qq.qq_no,
            'password': qq.password,
            'create_time': qq.create_time.strftime('%Y-%m-%d %H:%M:%S'),
            'update_time': qq.update_time.strftime('%Y-%m-%d %H:%M:%S'),
        }

    @staticmethod
    @NoneWrap
    def makeQQList(qqs):
        list = []
        for qq in qqs:
            list.append(Generator.makeQQ(qq))
        return list

    @staticmethod
    @NoneWrap
    def makeUser(user):
        return {
            'id': user.id,
            'qq_no': user.qq_no,
            'password': user.password,
            'create_time': user.create_time.strftime('%Y-%m-%d %H:%M:%S'),
            'update_time': user.update_time.strftime('%Y-%m-%d %H:%M:%S'),
        }

    @staticmethod
    @NoneWrap
    def makeUserList(users):
        list = []
        for qq in users:
            list.append(User.make(qq))
        return list


def object2dict(obj):
    # convert object to a dict
    d = {}
    d['__class__'] = obj.__class__.__name__
    d['__module__'] = obj.__module__
    d.update(obj.__dict__)
    return d


def dict2object(d):
    # convert dict to object
    if '__class__' in d:
        class_name = d.pop('__class__')
        module_name = d.pop('__module__')
        module = __import__(module_name)
        class_ = getattr(module, class_name)
        args = dict((key.encode('ascii'), value) for key, value in d.items())  # get args
        inst = class_(**args)  # create new instance
    else:
        inst = d
    return inst


class QQEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.strftime('%Y-%m-%d %H:%M:%S')
        elif isinstance(obj, date):
            return obj.strftime('%Y-%m-%d')
        elif isinstance(obj, QQ):
            # return obj.id, obj.qq_no, obj.password, obj.create_time, obj.update_time
            ret = {'id': obj.id,
                   'qq_no': obj.qq_no,
                   'password': obj.password,
                   'create_time': obj.create_time,
                   'update_time': obj.update_time
                   }
            return ret
        super(QQEncoder, self).default(obj)


class User(db.Model):
    __tablename__ = 'user'

    id = Column('id', Integer, primary_key=True)
    username = Column('username', String(128))
    email = Column('email', String(128))
    password = Column('password', String(128))
    create_time = Column('create_time', String(128))
    update_time = Column('update_time', String(128))

    def __init__(self, id, username, email, password, create_time, update_time):
        self.id = id
        self.username = username
        self.email = email
        self.password = password
        self.create_time = create_time
        self.update_time = update_time

    def __repr__(self):
        return '<id is %s, username is %s, password is %s, email is %s, create time is %s, update time is %s>' % (
            self.id, self.username, self.password, self.email, self.create_time, self.update_time)
