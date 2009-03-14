# Copyright austinchau, 2008.
# http://austinchau.blogspot.com/2008/11/serving-javascript-minified-with.html
# Copyright gravix, 2009.
# http://appengine-cookbook.appspot.com/recipe/combine-all-javascripts-together-automatically-for-faster-page-load/

import os
import re
import jsmin

import StringIO

from google.appengine.ext import webapp
from google.appengine.api import memcache

import wsgiref.handlers

jsm = jsmin.JavascriptMinify()

memCacheExpire = 900

def getFileName(path):
  regex = re.compile('/[a-zA-Z_]+/([a-zA-Z0-9_\-/]+\.(js|css))$')
  return 'js/' + regex.search(path).groups()[0]

def getFileContent(filename):  
  ospath = os.path.join(os.path.dirname(__file__), filename)
  input = open(ospath, 'r')
  return input.read()

def minify(filename):    
  path = os.path.join(os.path.dirname(__file__), filename)        
  input = open(path, 'r')
  output = StringIO.StringIO()

  jsm.minify(input, output)

  return output.getvalue()  

class JsMinify(webapp.RequestHandler):
  def get(self):
        
    data = memcache.get(self.request.path)    

    if data is None:
      filename = getFileName(self.request.path)
      data = minify(filename)   
      memcache.add(self.request.path, data, memCacheExpire)      

    self.response.headers['Content-Type'] = 'text/javascript'
    self.response.out.write(data)


class JsMinify_(webapp.RequestHandler):
  def get(self):
    filename = getFileName(self.request.path)
    data = minify(filename)              

    self.response.headers['Content-Type'] = 'text/javascript'
    self.response.out.write(data)


class JsNormal(webapp.RequestHandler):
  def get(self):      

    data = memcache.get(self.request.path)    

    if data is None:
      filename = getFileName(self.request.path)
      data = getFileContent(filename)
      memcache.add(self.request.path, data, memCacheExpire)   

    self.response.headers['Content-Type'] = 'text/javascript'
    self.response.out.write(data)

class JsNormal_(webapp.RequestHandler):
  def get(self):      
    filename = getFileName(self.request.path)
    data = getFileContent(filename)

    self.response.headers['Content-Type'] = 'text/javascript'
    self.response.out.write(data)
    
class JsAgg(webapp.RequestHandler):
  def get(self):

    data = memcache.get(key="JSAGG")

    if data is None:
      filenames = ["js/basic.js",
                   "js/checkers.js",
                   "js/url_helper.js"]
      data = ""
      for filename in filenames:
        data += minify(filename) + '\n'
      memcache.add(key="JSAGG", value=data, time=memCacheExpire)

    self.response.headers['Content-Type'] = 'text/javascript'
    self.response.out.write(data)

class JsAgg_(webapp.RequestHandler):
  def get(self):

    filenames = ["js/basic.js",
                 "js/checkers.js",
                 "js/url_helper.js"]
    data = ""
    for filename in filenames:
      data += minify(filename) + '\n'

    self.response.headers['Content-Type'] = 'text/javascript'
    self.response.out.write(data)


apps_binding = []

# serving normal javascript file from mem cache
apps_binding.append(('/js/.*', JsNormal))

# serving normal javascript file directly from disk
apps_binding.append(('/js_/.*', JsNormal_))

# serving minified javascript file from mem cache
apps_binding.append(('/js_min/.*', JsMinify))

# serving minified javascript file directly from disk
apps_binding.append(('/js_min_/.*', JsMinify_))

# serving minified/aggregated javascript from mem cache
apps_binding.append(('/js_agg/', JsAgg))

# serving minified/aggregated javascript
apps_binding.append(('/js_agg_/', JsAgg_))

application = webapp.WSGIApplication(apps_binding, debug=True)
wsgiref.handlers.CGIHandler().run(application)
