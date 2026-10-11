-- Inceleme (demo) hesabini doldurur: demo@gmail.com
-- Supabase > SQL Editor'da calistir. Tekrar calistirilabilir (once kendi
-- ekledigi "appreview-demo:v1" kayitlarini siler). Tarihler bugune goredir;
-- incelemeye gondermeden hemen once calistir ki son 14 gun dolu gorunsun.
do $$
declare uid uuid; tid uuid; r record; pfx text := 'appreview-demo:v1'; tn numeric;
begin
  select id into uid from auth.users where email = 'demo@gmail.com';
  if uid is null then raise exception 'demo@gmail.com bulunamadi'; end if;

  delete from trial_subjects where trial_id in (select id from trials where user_id=uid and client_operation_id like pfx||':%');
  delete from trials where user_id=uid and client_operation_id like pfx||':%';
  delete from study_logs where user_id=uid and client_operation_id like pfx||':%';
  delete from wrong_questions where user_id=uid and client_operation_id like pfx||':%';

  update profiles set exam_type='tyt_ayt', field='sayisal', target_net=100, baseline_net=62,
    daily_target=120, daily_question_goal=160, weekly_trials_goal=2, weekly_minutes_goal=900 where id=uid;

  -- a = [tur D,Y, mat D,Y, fen D,Y, sos D,Y] (AYT'de: mat, fiz, kim, bio). Inisli cikisli yukselis.
  for r in select * from (values
    ('tyt-1','TYT Genel Deneme 1',39,'TYT',null,'okay', array[27,8,18,10,9,5,13,4]),
    ('tyt-2','TYT Genel Deneme 2',32,'TYT',null,'good', array[30,6,21,9,11,4,15,3]),
    ('tyt-3','TYT Genel Deneme 3',25,'TYT',null,'okay', array[28,8,22,9,10,5,15,4]),
    ('tyt-4','TYT Genel Deneme 4',18,'TYT',null,'good', array[31,6,25,7,13,3,16,3]),
    ('tyt-5','TYT Genel Deneme 5',11,'TYT',null,'okay', array[30,7,24,8,12,4,17,2]),
    ('tyt-6','TYT Genel Deneme 6',4,'TYT',null,'good', array[33,4,27,6,14,3,17,2]),
    ('ayt-1','AYT Sayısal Deneme 1',29,'AYT_SAY','sayisal','okay', array[20,8,7,3,7,2,8,2]),
    ('ayt-2','AYT Sayısal Deneme 2',15,'AYT_SAY','sayisal','good', array[24,7,8,3,8,2,9,2]),
    ('ayt-3','AYT Sayısal Deneme 3',7,'AYT_SAY','sayisal','good', array[27,6,9,2,9,1,9,2])
  ) as t(id,name,d,et,fld,mood,a) loop
    tn := (r.a[1]+r.a[3]+r.a[5]+r.a[7]) - 0.25*(r.a[2]+r.a[4]+r.a[6]+r.a[8]);
    insert into trials(user_id,name,trial_date,exam_type,field,total_net,mood,client_operation_id,difficulty_level,difficulty_multiplier,normalization_version,normalization_confidence,raw_total_net,normalized_total_net)
    values(uid,r.name,current_date-r.d,r.et,r.fld,tn,r.mood,pfx||':trial:'||r.id,'standard',1,1,'self_reported',tn,tn) returning id into tid;
    if r.et='TYT' then
      insert into trial_subjects(trial_id,subject,correct_count,wrong_count,empty_count,wrong_penalty) values
       (tid,'tyt_turkce',r.a[1],r.a[2],40-r.a[1]-r.a[2],0.25),(tid,'tyt_matematik',r.a[3],r.a[4],40-r.a[3]-r.a[4],0.25),
       (tid,'tyt_fen',r.a[5],r.a[6],20-r.a[5]-r.a[6],0.25),(tid,'tyt_sosyal',r.a[7],r.a[8],20-r.a[7]-r.a[8],0.25);
    else
      insert into trial_subjects(trial_id,subject,correct_count,wrong_count,empty_count,wrong_penalty) values
       (tid,'ayt_matematik',r.a[1],r.a[2],40-r.a[1]-r.a[2],0.25),(tid,'ayt_fizik',r.a[3],r.a[4],14-r.a[3]-r.a[4],0.25),
       (tid,'ayt_kimya',r.a[5],r.a[6],13-r.a[5]-r.a[6],0.25),(tid,'ayt_biyoloji',r.a[7],r.a[8],13-r.a[7]-r.a[8],0.25);
    end if;
  end loop;

  -- Son 14 gunun her gunu dolu (ana sayfa cubuklari + seri).
  insert into study_logs(user_id,subject,topic,question_count,correct_count,duration_minutes,note,notes,study_date,created_at,client_operation_id)
  select uid,s,t,q,c,m,n,n,current_date-d,(current_date-d)+time '16:00'+(row_number() over ())*interval '1 minute',pfx||':study:'||lpad((row_number() over ())::text,2,'0')
  from (values
   ('tyt_turkce','Paragraf',42,34,55,13,'Paragrafta hız iyi, dikkat hatası kaldı.'),
   ('tyt_matematik','Problemler',36,25,70,13,'Yaş ve yüzde problemleri tekrar edildi.'),
   ('ayt_matematik','Fonksiyonlar',30,22,65,12,'Bileşke fonksiyon soruları çözüldü.'),
   ('tyt_fen','Hücre',22,17,40,12,'Biyoloji konu özeti + test.'),
   ('ayt_fizik','Elektrik',24,17,50,11,'Eşdeğer direnç soruları.'),
   ('tyt_sosyal','Tarih',28,21,45,10,'İnkılap tekrar testi.'),
   ('tyt_matematik','Temel Kavramlar',40,31,60,10,'İşlem hataları not edildi.'),
   ('ayt_kimya','Kimyasal Tepkimeler',26,20,55,9,'Denge sorularında gelişme var.'),
   ('tyt_turkce','Dil Bilgisi',32,24,45,8,'Fiilimsi ve cümle türleri.'),
   ('ayt_biyoloji','Kalıtım',24,18,50,8,'Çaprazlama soruları tekrar.'),
   ('ayt_matematik','Türev',34,25,75,7,'Türev alma kuralları.'),
   ('tyt_fen','Basınç',25,19,45,6,'Yanlışlar deftere aktarıldı.'),
   ('tyt_matematik','Problemler',45,34,80,6,'Hız ve işçi problemleri.'),
   ('tyt_turkce','Paragraf',40,33,50,5,'Süre tutarak çözüldü.'),
   ('ayt_fizik','Manyetizma',22,15,55,5,'Konu tekrarı + test.'),
   ('ayt_matematik','Limit',30,23,60,4,'Belirsizlik soruları.'),
   ('tyt_sosyal','Coğrafya',26,20,40,4,'İklim tipleri.'),
   ('tyt_matematik','Üçgenler',38,28,70,3,'Açı-kenar bağıntıları.'),
   ('ayt_kimya','Organik Kimya',28,21,60,3,'Fonksiyonel gruplar.'),
   ('tyt_turkce','Paragraf',44,37,55,2,'Yanlış sayısı düştü.'),
   ('ayt_biyoloji','Sinir Sistemi',24,19,45,2,'Konu özeti çıkarıldı.'),
   ('ayt_matematik','İntegral',32,24,75,1,'Alan hesabı soruları.'),
   ('tyt_fen','Kimyasal Türler',26,20,45,1,'Tekrar testi.'),
   ('tyt_matematik','Problemler',40,32,65,0,'Karışım problemleri.')
  ) as v(s,t,q,c,m,d,n);

  insert into wrong_questions(user_id,subject,topic,image_path,note,is_resolved,my_answer,correct_answer,next_review_at,interval_days,ease,topic_source,client_operation_id)
  select uid,s,t,null,n,false,ma,ca,(current_date-d)+time '08:00',1+(row_number() over ())%3,2.5,'manual',pfx||':wrong:'||lpad((row_number() over ())::text,2,'0')
  from (values
   ('tyt_matematik','Problemler','Yaş probleminde oranı ters kurmuşum.','B','D',5),
   ('tyt_turkce','Paragraf','Ana düşünce sorusunda çeldiriciye gittim.','A','C',4),
   ('ayt_matematik','Fonksiyonlar','Tanım kümesini kontrol etmeden işlem yaptım.','E','B',3),
   ('ayt_fizik','Elektrik','Eşdeğer dirençte paralel-seri ayrımına dikkat.','C','A',2),
   ('ayt_kimya','Kimyasal Denge','Le Chatelier yorumunda sıcaklık etkisini karıştırdım.','D','E',1),
   ('tyt_fen','Basınç','Sıvı basıncında derinlik dışındaki bilgiyi ele.','A','B',0)
  ) as v(s,t,n,ma,ca,d);

  insert into streaks(user_id,current_streak,longest_streak,last_study_date,updated_at) values(uid,14,14,current_date,now())
  on conflict (user_id) do update set current_streak=14, longest_streak=14, last_study_date=current_date, updated_at=now();
end $$;

select (select count(*) from trials t join auth.users u on u.id=t.user_id where u.email='demo@gmail.com') trials,
       (select count(*) from study_logs s join auth.users u on u.id=s.user_id where u.email='demo@gmail.com') logs,
       (select count(*) from wrong_questions w join auth.users u on u.id=w.user_id where u.email='demo@gmail.com') wrongs;
