# watcherjs 1.0
一个简单的、纯粹的、实现数据驱动的库
# 使用方法
使用构造函数，创建一个代理对象obj  
obj对象包含{a:1,b:2}对象中的所有属性，你可以把它看做是{a:1,b:2}的一个拷贝
<pre><code>
var obj = new Watcher({a:1,b:2});
</code></pre>
接下来的用法和angularjs中的scope.watch一致  
<pre><code>
obj.watch('a', function(newValue, oldValue){
  console.log(newValue);
});
</code></pre>
赋值  
<pre><code>
obj.a = 3;
</code></pre>
响应
<pre><code>
输出：3
</code></pre>
代理对象提供了copy方法，可以用于获取当前对象的副本
<pre><code>
obj.copy();
</code></pre>
返回
<pre><code>
{a:3,b:2}
</code></pre>
