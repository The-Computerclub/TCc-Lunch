create table colors(
    id serial primary key,
    value text
);

create table tokens(
    id serial primary key,
    value text
);

insert into tokens(value)
values('super-secret')
;